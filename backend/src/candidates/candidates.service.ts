import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { Candidate, Seniority } from './dto/create-candidate.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async parseExcelAndCombine(
    excelBuffer: Buffer | undefined,
    payload: { name: string; surname: string }
  ): Promise<Candidate> {
    if (!excelBuffer || excelBuffer.length === 0) {
      throw new BadRequestException('Excel file is required');
    }

    let extracted: Record<string, unknown>;

    try {
      const wb = XLSX.read(excelBuffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const rows: any[][] = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: null,
        raw: true,
      }) as any[][];

      const norm = (v: unknown) =>
        String(v ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase();

      const headerSets = {
        seniority: ['seniority', 'senioridad'],
        yearsMain: ['years of experience', 'anos de experiencia', 'años de experiencia'],
        yearsAlt: ['years', 'experience'],
        availability: ['availability', 'disponibilidad', 'available'],
      };

      function findHeaderRow(): { index: number; colByKey: Record<string, number> } | null {
        for (let r = 0; r < rows.length; r++) {
          const line = rows[r] ?? [];
          const cells = line.map(norm);
          const colByKey: Record<string, number> = {};

          const sIdx = cells.findIndex((c) => headerSets.seniority.includes(c));
          if (sIdx === -1) continue;
          colByKey['seniority'] = sIdx;

          let yIdx = cells.findIndex((c) => headerSets.yearsMain.includes(c));
          if (yIdx === -1) yIdx = cells.findIndex((c) => headerSets.yearsAlt.includes(c));
          if (yIdx === -1) continue;
          colByKey['years'] = yIdx;

          const aIdx = cells.findIndex((c) => headerSets.availability.includes(c));
          if (aIdx === -1) continue;
          colByKey['availability'] = aIdx;

          return { index: r, colByKey };
        }
        return null;
      }

      const headerInfo = findHeaderRow();
      if (!headerInfo) {
        throw new Error(
          'Headers not found. Required columns: seniority, years (or years of experience), availability'
        );
      }

      let dataRow: any[] | null = null;
      for (let r = headerInfo.index + 1; r < rows.length; r++) {
        const line = rows[r] ?? [];
        const hasData = line.some((v) => {
          if (v === null || v === undefined) return false;
          if (typeof v === 'string') return v.trim() !== '';
          return true;
        });
        if (hasData) {
          dataRow = line;
          break;
        }
      }
      if (!dataRow) {
        throw new Error('No data row found under the headers');
      }

      extracted = {
        seniority: dataRow[headerInfo.colByKey['seniority']],
        years: dataRow[headerInfo.colByKey['years']],
        availability: dataRow[headerInfo.colByKey['availability']],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Invalid Excel: ${msg}`);
    }

    const normalize = (s?: unknown) => (s ?? '').toString().trim().toLowerCase();

    const seniority = normalize(extracted.seniority) as Seniority;
    if (seniority !== 'junior' && seniority !== 'senior') {
      throw new BadRequestException('Seniority must be "junior" or "senior"');
    }

    const years = Number(extracted.years);
    if (!Number.isFinite(years) || years < 0) {
      throw new BadRequestException('Years of experience must be a non-negative number');
    }

    const availabilityStr = normalize(extracted.availability);
    const availability =
      ['true', 'yes', 'si', 'sí', '1'].includes(availabilityStr) ? true :
      ['false', 'no', '0'].includes(availabilityStr) ? false :
      (() => {
        throw new BadRequestException('Availability must be boolean');
      })();

    const candidate: Candidate = {
      id: randomUUID(),
      name: payload.name,
      surname: payload.surname,
      seniority,
      years,
      availability,
    };

    await this.prisma.candidate.create({
      data: {
        name: candidate.name,
        surname: candidate.surname,
        seniority: candidate.seniority,
        years: candidate.years,
        availability: candidate.availability,
      },
    });

    return candidate;
  }

  async listAllFromDb() {
    return this.prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });
  }

}
