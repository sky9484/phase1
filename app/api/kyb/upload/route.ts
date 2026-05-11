import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('documents').filter((item): item is File => item instanceof File);
  const legalName = String(formData.get('businessName') ?? '');
  const registrationNumber = String(formData.get('ssmNumber') ?? '');

  if (files.length === 0) {
    return NextResponse.json({ error: 'No KYB documents provided' }, { status: 400 });
  }

  if (!legalName || !registrationNumber) {
    return NextResponse.json({ error: 'Business name and registration number are required' }, { status: 400 });
  }

  const kybCaseId = `kyb_${Date.now().toString(36)}_${createHash('sha256').update(`${legalName}:${registrationNumber}`).digest('hex').slice(0, 10)}`;
  const documents = await Promise.all(
    files.map(async (file) => {
      const bytes = Buffer.from(await file.arrayBuffer());
      const hash = createHash('sha256').update(bytes).digest('hex');

      return {
        name: file.name,
        kind: file.name.toLowerCase().includes('director') ? 'DIRECTOR_ID' : 'COMPANY_DOCUMENT',
        type: file.type || 'application/octet-stream',
        size: file.size,
        sha256: hash,
        storageKey: `encrypted/kyb/${kybCaseId}/${hash}-${file.name}`,
        virusScanResult: 'PENDING',
        uploadedAt: new Date().toISOString(),
      };
    }),
  );

  return NextResponse.json({
    kybCaseId,
    state: 'SUBMITTED',
    documents,
  });
}
