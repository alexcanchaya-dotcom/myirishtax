const DUMMY_STORE = [];

export async function startOnboarding({ email, filingType }) {
  const record = {
    id: `onb-${Date.now()}`,
    email,
    filingType: filingType || 'PAYE',
    status: 'invited'
  };
  DUMMY_STORE.push(record);
  return record;
}

export async function uploadDocument({ filename, path, mimetype }) {
  const storedAt = `s3://placeholder-bucket/${Date.now()}-${filename}`;
  DUMMY_STORE.push({ filename, path, mimetype, storedAt });
  return { storedAt };
}

export async function scheduleReminder({ email, type, delayHours = 24 }) {
  const reminder = { id: `rem-${Date.now()}`, email, type, sendAt: Date.now() + delayHours * 3600 * 1000 };
  DUMMY_STORE.push(reminder);
  return reminder;
}

export async function createUpsellIntent({ email, service }) {
  const intent = { id: `upsell-${Date.now()}`, email, service, createdAt: Date.now() };
  DUMMY_STORE.push(intent);
  return intent;
}

export function getDebugStore() {
  return DUMMY_STORE;
}
