import uuid from 'react-native-uuid';
import { getDatabase } from './init';
import type {
  Doctor,
  Patient,
  Medicine,
  Prescription,
  PrescriptionItem,
  Template,
  Gender,
} from '../types';

// ============ DOCTOR ============

export async function getDoctor(): Promise<Doctor | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    qualification: string | null;
    registration_number: string;
    clinic_name: string | null;
    clinic_address: string | null;
    phone: string | null;
    email: string | null;
    signature_base64: string | null;
    logo_base64: string | null;
    created_at: number;
    updated_at: number;
  }>('SELECT * FROM doctor LIMIT 1');

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    qualification: row.qualification || '',
    registrationNumber: row.registration_number,
    clinicName: row.clinic_name || undefined,
    clinicAddress: row.clinic_address || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    signatureBase64: row.signature_base64 || undefined,
    logoBase64: row.logo_base64 || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveDoctor(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
  const db = await getDatabase();
  const now = Date.now();

  // Check if doctor exists
  const existing = await getDoctor();

  if (existing) {
    await db.runAsync(
      `UPDATE doctor SET
        name = ?, qualification = ?, registration_number = ?,
        clinic_name = ?, clinic_address = ?, phone = ?, email = ?,
        signature_base64 = ?, logo_base64 = ?, updated_at = ?
       WHERE id = ?`,
      [
        doctor.name,
        doctor.qualification,
        doctor.registrationNumber,
        doctor.clinicName || null,
        doctor.clinicAddress || null,
        doctor.phone || null,
        doctor.email || null,
        doctor.signatureBase64 || null,
        doctor.logoBase64 || null,
        now,
        existing.id,
      ]
    );
    return { ...existing, ...doctor, updatedAt: now };
  }

  const id = uuid.v4() as string;
  await db.runAsync(
    `INSERT INTO doctor (id, name, qualification, registration_number, clinic_name, clinic_address, phone, email, signature_base64, logo_base64, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      doctor.name,
      doctor.qualification,
      doctor.registrationNumber,
      doctor.clinicName || null,
      doctor.clinicAddress || null,
      doctor.phone || null,
      doctor.email || null,
      doctor.signatureBase64 || null,
      doctor.logoBase64 || null,
      now,
      now,
    ]
  );

  return { id, ...doctor, createdAt: now, updatedAt: now };
}

// ============ PATIENTS ============

export async function getPatients(limit = 50): Promise<Patient[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    age: number | null;
    gender: Gender | null;
    phone: string | null;
    last_visit: number;
    visit_count: number;
    created_at: number;
  }>('SELECT * FROM patients ORDER BY last_visit DESC LIMIT ?', [limit]);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age || undefined,
    gender: row.gender || undefined,
    phone: row.phone || undefined,
    lastVisit: row.last_visit,
    visitCount: row.visit_count,
    createdAt: row.created_at,
  }));
}

export async function searchPatients(query: string, limit = 10): Promise<Patient[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    age: number | null;
    gender: Gender | null;
    phone: string | null;
    last_visit: number;
    visit_count: number;
    created_at: number;
  }>(
    `SELECT * FROM patients
     WHERE name LIKE ? OR phone LIKE ?
     ORDER BY visit_count DESC, last_visit DESC
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, limit]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age || undefined,
    gender: row.gender || undefined,
    phone: row.phone || undefined,
    lastVisit: row.last_visit,
    visitCount: row.visit_count,
    createdAt: row.created_at,
  }));
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    age: number | null;
    gender: Gender | null;
    phone: string | null;
    last_visit: number;
    visit_count: number;
    created_at: number;
  }>('SELECT * FROM patients WHERE id = ?', [id]);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    age: row.age || undefined,
    gender: row.gender || undefined,
    phone: row.phone || undefined,
    lastVisit: row.last_visit,
    visitCount: row.visit_count,
    createdAt: row.created_at,
  };
}

export async function savePatient(
  patient: Omit<Patient, 'id' | 'lastVisit' | 'visitCount' | 'createdAt'>,
  existingId?: string
): Promise<Patient> {
  const db = await getDatabase();
  const now = Date.now();

  if (existingId) {
    // Update existing patient
    await db.runAsync(
      `UPDATE patients SET
        name = ?, age = ?, gender = ?, phone = ?,
        last_visit = ?, visit_count = visit_count + 1
       WHERE id = ?`,
      [patient.name, patient.age || null, patient.gender || null, patient.phone || null, now, existingId]
    );

    const updated = await getPatientById(existingId);
    return updated!;
  }

  // Create new patient
  const id = uuid.v4() as string;
  await db.runAsync(
    `INSERT INTO patients (id, name, age, gender, phone, last_visit, visit_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [id, patient.name, patient.age || null, patient.gender || null, patient.phone || null, now, now]
  );

  return {
    id,
    ...patient,
    lastVisit: now,
    visitCount: 1,
    createdAt: now,
  };
}

// ============ MEDICINES ============

export async function getMedicines(limit = 100): Promise<Medicine[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    generic_name: string;
    brand_name: string | null;
    strength: string | null;
    form: string;
    default_dose: string | null;
    default_frequency: string | null;
    default_duration: string | null;
    default_instruction: string | null;
    use_count: number;
    is_custom: number;
  }>('SELECT * FROM medicines ORDER BY use_count DESC LIMIT ?', [limit]);

  return rows.map(mapMedicineRow);
}

export async function searchMedicines(query: string, limit = 15): Promise<Medicine[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    generic_name: string;
    brand_name: string | null;
    strength: string | null;
    form: string;
    default_dose: string | null;
    default_frequency: string | null;
    default_duration: string | null;
    default_instruction: string | null;
    use_count: number;
    is_custom: number;
  }>(
    `SELECT * FROM medicines
     WHERE generic_name LIKE ? OR brand_name LIKE ?
     ORDER BY use_count DESC, generic_name
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, limit]
  );

  return rows.map(mapMedicineRow);
}

export async function getTopMedicines(limit = 10): Promise<Medicine[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    generic_name: string;
    brand_name: string | null;
    strength: string | null;
    form: string;
    default_dose: string | null;
    default_frequency: string | null;
    default_duration: string | null;
    default_instruction: string | null;
    use_count: number;
    is_custom: number;
  }>('SELECT * FROM medicines WHERE use_count > 0 ORDER BY use_count DESC LIMIT ?', [limit]);

  return rows.map(mapMedicineRow);
}

export async function incrementMedicineUseCount(medicineId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE medicines SET use_count = use_count + 1 WHERE id = ?', [medicineId]);
}

export async function addCustomMedicine(
  medicine: Omit<Medicine, 'id' | 'useCount' | 'isCustom'>
): Promise<Medicine> {
  const db = await getDatabase();
  const id = uuid.v4() as string;

  await db.runAsync(
    `INSERT INTO medicines (id, generic_name, brand_name, strength, form, default_dose, default_frequency, default_duration, default_instruction, use_count, is_custom)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    [
      id,
      medicine.genericName,
      medicine.brandName || null,
      medicine.strength || null,
      medicine.form,
      medicine.defaultDose || null,
      medicine.defaultFrequency || null,
      medicine.defaultDuration || null,
      medicine.defaultInstruction || null,
    ]
  );

  return {
    id,
    ...medicine,
    useCount: 1,
    isCustom: true,
  };
}

function mapMedicineRow(row: {
  id: string;
  generic_name: string;
  brand_name: string | null;
  strength: string | null;
  form: string;
  default_dose: string | null;
  default_frequency: string | null;
  default_duration: string | null;
  default_instruction: string | null;
  use_count: number;
  is_custom: number;
}): Medicine {
  return {
    id: row.id,
    genericName: row.generic_name,
    brandName: row.brand_name || undefined,
    strength: row.strength || undefined,
    form: row.form as Medicine['form'],
    defaultDose: row.default_dose || undefined,
    defaultFrequency: row.default_frequency || undefined,
    defaultDuration: row.default_duration || undefined,
    defaultInstruction: row.default_instruction || undefined,
    useCount: row.use_count,
    isCustom: row.is_custom === 1,
  };
}

// ============ PRESCRIPTIONS ============

export async function getPrescriptions(limit = 50): Promise<Prescription[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis: string | null;
    advice: string | null;
    follow_up_days: number | null;
    pdf_path: string | null;
    created_at: number;
    patient_name: string;
    patient_age: number | null;
    patient_gender: Gender | null;
  }>(
    `SELECT p.*, pt.name as patient_name, pt.age as patient_age, pt.gender as patient_gender
     FROM prescriptions p
     LEFT JOIN patients pt ON p.patient_id = pt.id
     ORDER BY p.created_at DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    diagnosis: row.diagnosis || undefined,
    advice: row.advice || undefined,
    followUpDays: row.follow_up_days || undefined,
    pdfPath: row.pdf_path || undefined,
    createdAt: row.created_at,
    patient: {
      id: row.patient_id,
      name: row.patient_name,
      age: row.patient_age || undefined,
      gender: row.patient_gender || undefined,
      lastVisit: row.created_at,
      visitCount: 1,
      createdAt: row.created_at,
    },
  }));
}

export async function getPrescriptionById(id: string): Promise<Prescription | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis: string | null;
    advice: string | null;
    follow_up_days: number | null;
    pdf_path: string | null;
    created_at: number;
  }>('SELECT * FROM prescriptions WHERE id = ?', [id]);

  if (!row) return null;

  const items = await getPrescriptionItems(id);
  const patient = await getPatientById(row.patient_id);

  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    diagnosis: row.diagnosis || undefined,
    advice: row.advice || undefined,
    followUpDays: row.follow_up_days || undefined,
    pdfPath: row.pdf_path || undefined,
    createdAt: row.created_at,
    items,
    patient: patient || undefined,
  };
}

export async function getLastPrescription(): Promise<Prescription | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM prescriptions ORDER BY created_at DESC LIMIT 1'
  );
  if (!row) return null;
  return getPrescriptionById(row.id);
}

export async function getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20',
    [patientId]
  );

  const prescriptions: Prescription[] = [];
  for (const row of rows) {
    const rx = await getPrescriptionById(row.id);
    if (rx) prescriptions.push(rx);
  }
  return prescriptions;
}

export async function savePrescription(
  prescription: Omit<Prescription, 'id' | 'createdAt'>,
  items: Omit<PrescriptionItem, 'id' | 'prescriptionId'>[]
): Promise<Prescription> {
  const db = await getDatabase();
  const id = uuid.v4() as string;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO prescriptions (id, patient_id, doctor_id, diagnosis, advice, follow_up_days, pdf_path, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      prescription.patientId,
      prescription.doctorId,
      prescription.diagnosis || null,
      prescription.advice || null,
      prescription.followUpDays || null,
      prescription.pdfPath || null,
      now,
    ]
  );

  // Insert items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await db.runAsync(
      `INSERT INTO prescription_items (id, prescription_id, medicine_id, medicine_name, dose, frequency, duration, duration_unit, instruction, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid.v4() as string,
        id,
        item.medicineId || null,
        item.medicineName,
        item.dose || null,
        item.frequency || null,
        item.duration || null,
        item.durationUnit || 'days',
        item.instruction || null,
        i,
      ]
    );

    // Increment medicine use count
    if (item.medicineId) {
      await incrementMedicineUseCount(item.medicineId);
    }
  }

  return {
    id,
    ...prescription,
    createdAt: now,
    items: items.map((item, i) => ({
      id: '',
      prescriptionId: id,
      ...item,
      sortOrder: i,
    })),
  };
}

export async function updatePrescriptionPdfPath(id: string, pdfPath: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE prescriptions SET pdf_path = ? WHERE id = ?', [pdfPath, id]);
}

async function getPrescriptionItems(prescriptionId: string): Promise<PrescriptionItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    prescription_id: string;
    medicine_id: string | null;
    medicine_name: string;
    dose: string | null;
    frequency: string | null;
    duration: string | null;
    duration_unit: string;
    instruction: string | null;
    sort_order: number;
  }>('SELECT * FROM prescription_items WHERE prescription_id = ? ORDER BY sort_order', [
    prescriptionId,
  ]);

  return rows.map((row) => ({
    id: row.id,
    prescriptionId: row.prescription_id,
    medicineId: row.medicine_id || undefined,
    medicineName: row.medicine_name,
    dose: row.dose || undefined,
    frequency: row.frequency || undefined,
    duration: row.duration || undefined,
    durationUnit: (row.duration_unit || 'days') as 'days' | 'weeks' | 'months',
    instruction: row.instruction || undefined,
    sortOrder: row.sort_order,
  }));
}

// ============ TEMPLATES ============

export async function getTemplates(): Promise<Template[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    diagnosis: string | null;
    medicines_json: string;
    advice: string | null;
    use_count: number;
    created_at: number;
  }>('SELECT * FROM templates ORDER BY use_count DESC, created_at DESC');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    diagnosis: row.diagnosis || undefined,
    medicinesJson: row.medicines_json,
    advice: row.advice || undefined,
    useCount: row.use_count,
    createdAt: row.created_at,
  }));
}

export async function saveTemplate(
  template: Omit<Template, 'id' | 'useCount' | 'createdAt'>
): Promise<Template> {
  const db = await getDatabase();
  const id = uuid.v4() as string;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO templates (id, name, diagnosis, medicines_json, advice, use_count, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [id, template.name, template.diagnosis || null, template.medicinesJson, template.advice || null, now]
  );

  return {
    id,
    ...template,
    useCount: 0,
    createdAt: now,
  };
}

export async function incrementTemplateUseCount(templateId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE templates SET use_count = use_count + 1 WHERE id = ?', [templateId]);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM templates WHERE id = ?', [templateId]);
}
