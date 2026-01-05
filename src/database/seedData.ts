import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';

// Common medicines used in Indian OPD practice
const COMMON_MEDICINES = [
  // Analgesics / Antipyretics
  { genericName: 'Paracetamol', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '3', defaultInstruction: 'After food' },
  { genericName: 'Paracetamol', strength: '650mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '3', defaultInstruction: 'After food' },
  { genericName: 'Ibuprofen', strength: '400mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '3', defaultInstruction: 'After food' },
  { genericName: 'Diclofenac', strength: '50mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '3', defaultInstruction: 'After food' },
  { genericName: 'Aceclofenac', strength: '100mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '3', defaultInstruction: 'After food' },

  // Antibiotics
  { genericName: 'Azithromycin', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '3', defaultInstruction: 'After food' },
  { genericName: 'Amoxicillin', strength: '500mg', form: 'capsule', defaultDose: '1 cap', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Amoxicillin + Clavulanic Acid', strength: '625mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Cefixime', strength: '200mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Ciprofloxacin', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Levofloxacin', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Doxycycline', strength: '100mg', form: 'capsule', defaultDose: '1 cap', defaultFrequency: '1-0-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Metronidazole', strength: '400mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },

  // Antihistamines
  { genericName: 'Cetirizine', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '0-0-1', defaultDuration: '5', defaultInstruction: 'At bedtime' },
  { genericName: 'Levocetirizine', strength: '5mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '0-0-1', defaultDuration: '5', defaultInstruction: 'At bedtime' },
  { genericName: 'Fexofenadine', strength: '120mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '5', defaultInstruction: 'Before food' },
  { genericName: 'Chlorpheniramine', strength: '4mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '3', defaultInstruction: 'After food' },

  // Antacids / PPI
  { genericName: 'Pantoprazole', strength: '40mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '14', defaultInstruction: 'Before food' },
  { genericName: 'Omeprazole', strength: '20mg', form: 'capsule', defaultDose: '1 cap', defaultFrequency: '1-0-0', defaultDuration: '14', defaultInstruction: 'Before food' },
  { genericName: 'Rabeprazole', strength: '20mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '14', defaultInstruction: 'Before food' },
  { genericName: 'Ranitidine', strength: '150mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '7', defaultInstruction: 'Before food' },
  { genericName: 'Domperidone', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'Before food' },

  // Cough / Cold
  { genericName: 'Dextromethorphan + Phenylephrine', strength: '', form: 'syrup', defaultDose: '2 tsp', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Ambroxol', strength: '30mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Bromhexine', strength: '8mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Montelukast', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '0-0-1', defaultDuration: '7', defaultInstruction: 'At bedtime' },
  { genericName: 'Salbutamol', strength: '4mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },

  // Antidiabetics
  { genericName: 'Metformin', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '30', defaultInstruction: 'After food' },
  { genericName: 'Metformin', strength: '1000mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '30', defaultInstruction: 'After food' },
  { genericName: 'Glimepiride', strength: '1mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'Before food' },
  { genericName: 'Glimepiride', strength: '2mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'Before food' },
  { genericName: 'Sitagliptin', strength: '100mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'After food' },

  // Antihypertensives
  { genericName: 'Amlodipine', strength: '5mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'Any time' },
  { genericName: 'Amlodipine', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'Any time' },
  { genericName: 'Telmisartan', strength: '40mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'Any time' },
  { genericName: 'Losartan', strength: '50mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'Any time' },
  { genericName: 'Atenolol', strength: '50mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'After food' },

  // Vitamins / Supplements
  { genericName: 'Vitamin B Complex', strength: '', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'After food' },
  { genericName: 'Vitamin D3', strength: '60000 IU', form: 'sachet', defaultDose: '1 sachet', defaultFrequency: 'Once weekly', defaultDuration: '8', defaultInstruction: 'After food' },
  { genericName: 'Calcium + Vitamin D3', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-1', defaultDuration: '30', defaultInstruction: 'After food' },
  { genericName: 'Iron + Folic Acid', strength: '', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'After food' },
  { genericName: 'Multivitamin', strength: '', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '30', defaultInstruction: 'After food' },

  // Antispasmodics
  { genericName: 'Dicyclomine', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '3', defaultInstruction: 'Before food' },
  { genericName: 'Hyoscine Butylbromide', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: 'SOS', defaultDuration: '3', defaultInstruction: 'As needed' },
  { genericName: 'Mefenamic Acid', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '3', defaultInstruction: 'After food' },

  // Antidiarrheal
  { genericName: 'Loperamide', strength: '2mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: 'SOS', defaultDuration: '2', defaultInstruction: 'After each loose stool' },
  { genericName: 'ORS', strength: '', form: 'sachet', defaultDose: '1 sachet', defaultFrequency: 'After each stool', defaultDuration: '3', defaultInstruction: 'Mix in 1L water' },
  { genericName: 'Racecadotril', strength: '100mg', form: 'capsule', defaultDose: '1 cap', defaultFrequency: '1-1-1', defaultDuration: '3', defaultInstruction: 'Before food' },

  // Steroids
  { genericName: 'Prednisolone', strength: '5mg', form: 'tablet', defaultDose: '2 tab', defaultFrequency: '1-0-0', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Deflazacort', strength: '6mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-0-0', defaultDuration: '5', defaultInstruction: 'After food' },

  // Antiemetics
  { genericName: 'Ondansetron', strength: '4mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '3', defaultInstruction: 'Before food' },
  { genericName: 'Metoclopramide', strength: '10mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '3', defaultInstruction: 'Before food' },

  // Muscle relaxants
  { genericName: 'Thiocolchicoside', strength: '4mg', form: 'capsule', defaultDose: '1 cap', defaultFrequency: '1-0-1', defaultDuration: '5', defaultInstruction: 'After food' },
  { genericName: 'Chlorzoxazone', strength: '500mg', form: 'tablet', defaultDose: '1 tab', defaultFrequency: '1-1-1', defaultDuration: '5', defaultInstruction: 'After food' },

  // Topical
  { genericName: 'Clotrimazole', strength: '1%', form: 'cream', defaultDose: 'Apply locally', defaultFrequency: '1-0-1', defaultDuration: '7', defaultInstruction: 'Apply on affected area' },
  { genericName: 'Mupirocin', strength: '2%', form: 'ointment', defaultDose: 'Apply locally', defaultFrequency: '1-1-1', defaultDuration: '7', defaultInstruction: 'Apply on affected area' },
  { genericName: 'Betamethasone', strength: '0.1%', form: 'cream', defaultDose: 'Apply locally', defaultFrequency: '1-0-1', defaultDuration: '7', defaultInstruction: 'Apply thin layer' },

  // Eye drops
  { genericName: 'Ciprofloxacin', strength: '0.3%', form: 'drops', defaultDose: '1 drop', defaultFrequency: '1-1-1-1', defaultDuration: '5', defaultInstruction: 'In affected eye' },
  { genericName: 'Moxifloxacin', strength: '0.5%', form: 'drops', defaultDose: '1 drop', defaultFrequency: '1-1-1', defaultDuration: '7', defaultInstruction: 'In affected eye' },
];

export async function seedMedicines(db: SQLite.SQLiteDatabase): Promise<void> {
  const insertStmt = await db.prepareAsync(
    `INSERT INTO medicines (id, generic_name, brand_name, strength, form, default_dose, default_frequency, default_duration, default_instruction, use_count, is_custom)
     VALUES ($id, $generic_name, $brand_name, $strength, $form, $default_dose, $default_frequency, $default_duration, $default_instruction, 0, 0)`
  );

  try {
    for (const med of COMMON_MEDICINES) {
      await insertStmt.executeAsync({
        $id: uuid.v4() as string,
        $generic_name: med.genericName,
        $brand_name: null,
        $strength: med.strength,
        $form: med.form,
        $default_dose: med.defaultDose,
        $default_frequency: med.defaultFrequency,
        $default_duration: med.defaultDuration,
        $default_instruction: med.defaultInstruction,
      });
    }
  } finally {
    await insertStmt.finalizeAsync();
  }

  console.log(`Seeded ${COMMON_MEDICINES.length} medicines`);
}
