import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import type { Doctor, Patient, Prescription, PrescriptionItem } from '../types';
import { updatePrescriptionPdfPath } from '../database/repositories';

interface GeneratePdfParams {
  doctor: Doctor;
  patient: Patient;
  prescription: Prescription;
  items: PrescriptionItem[];
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatInstruction(instruction?: string): string {
  const shortForms: Record<string, string> = {
    'Before food': 'BF',
    'After food': 'AF',
    'With food': 'WF',
    'Empty stomach': 'ES',
    'At bedtime': 'HS',
    'As needed': 'SOS',
  };
  return shortForms[instruction || ''] || instruction || '';
}

function getMedicineFormPrefix(medicineName: string): string {
  const name = medicineName.toLowerCase();
  if (name.includes('syrup') || name.includes('syp')) return 'Syp.';
  if (name.includes('capsule') || name.includes('cap')) return 'Cap.';
  if (name.includes('injection') || name.includes('inj')) return 'Inj.';
  if (name.includes('cream')) return 'Cr.';
  if (name.includes('ointment')) return 'Oint.';
  if (name.includes('drops') || name.includes('drop')) return 'Drops';
  if (name.includes('inhaler')) return 'Inh.';
  return 'Tab.';
}

function generatePrescriptionHtml({
  doctor,
  patient,
  prescription,
  items,
}: GeneratePdfParams): string {
  const medicinesHtml = items
    .map((item, index) => {
      const prefix = getMedicineFormPrefix(item.medicineName);
      const instruction = formatInstruction(item.instruction);
      const duration = item.duration
        ? `${item.duration} ${item.durationUnit || 'days'}`
        : '';

      return `
        <tr>
          <td class="med-num">${index + 1}.</td>
          <td class="med-name">
            <strong>${prefix} ${item.medicineName}</strong>
            ${item.dose ? `<span class="dose">${item.dose}</span>` : ''}
          </td>
          <td class="med-freq">${item.frequency || ''}</td>
          <td class="med-duration">${duration}</td>
          <td class="med-instruction">[${instruction}]</td>
        </tr>
      `;
    })
    .join('');

  const adviceItems = prescription.advice
    ?.split('\n')
    .filter((a) => a.trim())
    .map((a) => `<li>${a.trim()}</li>`)
    .join('') || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }

    .doctor-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .doctor-name {
      font-size: 18pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 4px;
    }

    .doctor-qual {
      font-size: 11pt;
      color: #4b5563;
      margin-bottom: 2px;
    }

    .doctor-reg {
      font-size: 10pt;
      color: #6b7280;
    }

    .clinic-info {
      text-align: right;
      font-size: 10pt;
      color: #4b5563;
    }

    .clinic-name {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .patient-section {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      padding: 12px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }

    .patient-info {
      font-size: 11pt;
    }

    .patient-name {
      font-weight: 600;
      font-size: 12pt;
      margin-bottom: 4px;
    }

    .date-info {
      text-align: right;
      font-size: 11pt;
    }

    .diagnosis-section {
      margin-bottom: 15px;
      padding: 10px 15px;
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 0 6px 6px 0;
    }

    .diagnosis-label {
      font-size: 9pt;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .diagnosis-text {
      font-weight: 500;
      color: #78350f;
    }

    .rx-section {
      margin-bottom: 20px;
    }

    .rx-symbol {
      font-size: 24pt;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }

    .medicines-table {
      width: 100%;
      border-collapse: collapse;
    }

    .medicines-table tr {
      border-bottom: 1px solid #e5e7eb;
    }

    .medicines-table tr:last-child {
      border-bottom: none;
    }

    .medicines-table td {
      padding: 10px 5px;
      vertical-align: top;
    }

    .med-num {
      width: 30px;
      color: #6b7280;
      font-weight: 500;
    }

    .med-name {
      width: 40%;
    }

    .med-name .dose {
      display: block;
      font-size: 10pt;
      color: #6b7280;
      margin-top: 2px;
    }

    .med-freq {
      width: 15%;
      text-align: center;
      font-weight: 500;
      color: #2563eb;
    }

    .med-duration {
      width: 15%;
      text-align: center;
      color: #4b5563;
    }

    .med-instruction {
      width: 15%;
      text-align: right;
      font-size: 10pt;
      color: #6b7280;
    }

    .advice-section {
      background: #ecfdf5;
      padding: 12px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }

    .advice-label {
      font-size: 9pt;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .advice-list {
      margin: 0;
      padding-left: 18px;
      color: #065f46;
    }

    .advice-list li {
      margin-bottom: 3px;
    }

    .followup-section {
      background: #eff6ff;
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .followup-text {
      color: #1e40af;
      font-weight: 500;
    }

    .signature-section {
      text-align: right;
      margin-top: 30px;
      padding-top: 15px;
    }

    .signature-box {
      display: inline-block;
      text-align: center;
      min-width: 200px;
    }

    .signature-line {
      border-top: 1px solid #9ca3af;
      padding-top: 5px;
      margin-top: 40px;
    }

    .signature-name {
      font-weight: 600;
      color: #1e40af;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #9ca3af;
    }

    @media print {
      body {
        padding: 0;
      }
      .header {
        page-break-after: avoid;
      }
      .rx-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="doctor-info">
      <div>
        <div class="doctor-name">Dr. ${doctor.name}</div>
        <div class="doctor-qual">${doctor.qualification}</div>
        <div class="doctor-reg">Reg. No: ${doctor.registrationNumber}</div>
      </div>
      <div class="clinic-info">
        ${doctor.clinicName ? `<div class="clinic-name">${doctor.clinicName}</div>` : ''}
        ${doctor.clinicAddress ? `<div>${doctor.clinicAddress}</div>` : ''}
        ${doctor.phone ? `<div>Ph: ${doctor.phone}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="patient-section">
    <div class="patient-info">
      <div class="patient-name">${patient.name}</div>
      <div>Age/Sex: ${patient.age || '-'} years / ${patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</div>
      ${patient.phone ? `<div>Ph: ${patient.phone}</div>` : ''}
    </div>
    <div class="date-info">
      <div><strong>Date:</strong> ${formatDate(prescription.createdAt)}</div>
    </div>
  </div>

  ${prescription.diagnosis ? `
  <div class="diagnosis-section">
    <div class="diagnosis-label">Diagnosis</div>
    <div class="diagnosis-text">${prescription.diagnosis}</div>
  </div>
  ` : ''}

  <div class="rx-section">
    <div class="rx-symbol">℞</div>
    <table class="medicines-table">
      ${medicinesHtml}
    </table>
  </div>

  ${adviceItems ? `
  <div class="advice-section">
    <div class="advice-label">Advice</div>
    <ul class="advice-list">
      ${adviceItems}
    </ul>
  </div>
  ` : ''}

  ${prescription.followUpDays ? `
  <div class="followup-section">
    <span class="followup-text">Follow-up: After ${prescription.followUpDays} days</span>
  </div>
  ` : ''}

  <div class="signature-section">
    <div class="signature-box">
      ${doctor.signatureBase64 ? `<img src="${doctor.signatureBase64}" style="max-height: 60px; max-width: 150px;" />` : ''}
      <div class="signature-line">
        <div class="signature-name">Dr. ${doctor.name}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Generated by RxFast • This is a computer-generated prescription
  </div>
</body>
</html>
  `;
}

export async function generatePrescriptionPdf(params: GeneratePdfParams): Promise<string> {
  const html = generatePrescriptionHtml(params);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // Move to a permanent location with proper name
  const fileName = `Rx_${params.patient.name.replace(/\s+/g, '_')}_${formatDate(params.prescription.createdAt)}.pdf`;
  const newPath = `${FileSystem.documentDirectory}prescriptions/${fileName}`;

  // Ensure directory exists
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}prescriptions/`, {
    intermediates: true,
  });

  await FileSystem.moveAsync({
    from: uri,
    to: newPath,
  });

  // Update prescription with PDF path
  await updatePrescriptionPdfPath(params.prescription.id, newPath);

  return newPath;
}

export async function sharePrescriptionPdf(pdfPath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(pdfPath, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Prescription',
    UTI: 'com.adobe.pdf',
  });
}

export async function printPrescription(params: GeneratePdfParams): Promise<void> {
  const html = generatePrescriptionHtml(params);
  await Print.printAsync({ html });
}

export { generatePrescriptionHtml };
