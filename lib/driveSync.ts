import type { GymTrackerData } from './types';

const DRIVE_FILE_NAME = 'gym-tracker-data.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';

async function findRemoteFileId(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${DRIVE_FILE_NAME}' and trashed=false`);
  const res = await fetch(`${DRIVE_API}?q=${query}&spaces=drive&fields=files(id,modifiedTime)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Drive lookup failed: ${res.status}`);
  const json = await res.json();
  return json.files?.[0]?.id ?? null;
}

export async function downloadRemoteData(accessToken: string): Promise<GymTrackerData | null> {
  const fileId = await findRemoteFileId(accessToken);
  if (!fileId) return null;

  const res = await fetch(`${DRIVE_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  return (await res.json()) as GymTrackerData;
}

export async function uploadRemoteData(accessToken: string, data: GymTrackerData): Promise<void> {
  const fileId = await findRemoteFileId(accessToken);
  const body = JSON.stringify(data);

  if (fileId) {
    const res = await fetch(`${DRIVE_UPLOAD_API}/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) throw new Error(`Drive update failed: ${res.status}`);
    return;
  }

  const form = new FormData();
  form.append(
    'metadata',
    JSON.stringify({ name: DRIVE_FILE_NAME, mimeType: 'application/json' }) as any
  );
  form.append('file', body as any);

  const res = await fetch(`${DRIVE_UPLOAD_API}?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
}

// Last-write-wins on updatedAt: whichever copy is newer becomes the merged
// result. Single-user/single-device, so no field-level conflict resolution.
export function mergeByRecency(local: GymTrackerData, remote: GymTrackerData): GymTrackerData {
  return remote.updatedAt > local.updatedAt ? remote : local;
}
