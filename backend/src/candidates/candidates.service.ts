import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import { Candidate as CandidateDto, Seniority } from './dto/create-candidate.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async parseExcelAndCombine(
    excelBuffer: Buffer | undefined,
    payload: { name: string; surname: string }
  ): Promise<CandidateDto> {
    if (!excelBuffer || excelBuffer.length === 0) {
      throw new BadRequestException('Excel file is required');
    }

    let row: Record<string, unknown> | undefined;
    try {
      const wb = XLSX.read(excelBuffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
      if (!json.length) throw new Error('Excel is empty');
      if (json.length > 1) throw new Error('Only 1 row allowed');
      row = json[0];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Invalid Excel: ${msg}`);
    }

    const norm = (v?: unknown) => (v ?? '').toString().trim().toLowerCase();
    const keys = Object.keys(row!).reduce<Record<string, unknown>>((acc, k) => {
      acc[norm(k)] = (row as any)[k];
      return acc;
    }, {});
    const pick = (...c: string[]) => c.map(norm).map(k => keys[k]).find(v => v !== undefined);

    const seniorityRaw = pick('seniority', 'senioridad');
    const yearsRaw = pick('years of experience', 'años de experiencia', 'years', 'experience');
    const availRaw = pick('availability', 'disponibilidad', 'available');

    const seniority = norm(seniorityRaw) as Seniority;
    if (seniority !== 'junior' && seniority !== 'senior') {
      throw new BadRequestException('Seniority must be "junior" or "senior"');
    }
    const years = Number(yearsRaw);
    if (!Number.isFinite(years) || years < 0) {
      throw new BadRequestException('Years of experience must be a non-negative number');
    }
    const av = norm(availRaw);
    const availability =
      ['true', 'yes', 'si', 'sí', '1'].includes(av) ? true :
      ['false', 'no', '0'].includes(av) ? false :
      (() => { throw new BadRequestException('Availability must be boolean'); })();

    // 1) Respuesta para el front (persistencia en el front)
    const candidate: CandidateDto = {
      id: randomUUID(),
      name: payload.name,
      surname: payload.surname,
      seniority,
      years,
      availability,
    };

    // 2) Guardado en DB (para tu demo)
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

  // Endpoint opcional para que la empresa vea lo guardado en DB:
  listAllFromDb() {
    return this.prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
