import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { ApiError } from '../utils/errors.js';
import { asObject, optionalString, requireString } from '../utils/validate.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['application/pdf', '.pdf'],
]);

const tenantId = (req: Request) => {
  if (!req.tenant) throw ApiError.badRequest('Tenant context is required');
  return req.tenant.id;
};

export const uploadFile = async (req: Request, res: Response) => {
  const tid = tenantId(req);
  const body = asObject(req.body);
  const filename = requireString(body.filename, 'filename', { max: 255 });
  const data = requireString(body.data, 'data', { max: 8 * 1024 * 1024, trim: false });

  const match = /^data:([^;]+);base64,(.+)$/.exec(data);
  const mimeType = optionalString(body.mimeType, 'mimeType', { max: 100 }) || match?.[1] || '';
  if (!ALLOWED_MIME.has(mimeType)) {
    throw ApiError.badRequest('Only images and PDF files are allowed');
  }

  const base64 = match?.[2] || data;
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) throw ApiError.badRequest('Empty file');
  if (buffer.length > MAX_BYTES) throw ApiError.badRequest('File exceeds the 5 MB limit');

  const extension = ALLOWED_MIME.get(mimeType) || path.extname(filename) || '';
  const directory = path.resolve(process.cwd(), 'uploads', String(tid));
  await fs.mkdir(directory, { recursive: true });
  const key = `${Date.now()}-${randomUUID()}${extension}`;
  await fs.writeFile(path.join(directory, key), buffer);

  const origin = `${req.protocol}://${req.get('host')}`;
  res.status(201).json({
    data: {
      url: `${origin}/uploads/${tid}/${key}`,
      name: filename,
      mimeType,
      size: buffer.length,
    },
  });
};
