/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoogleDriveResource {
  id: string | null;
  type: 'image' | 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'video' | 'generic';
  previewUrl: string | null;
  icon: string;
  typeName: string;
}

export function parseGoogleDriveUrl(url: string | undefined | null): GoogleDriveResource | null {
  if (!url) return null;

  const trimmed = url.trim();
  const isDrive = trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
  if (!isDrive) return null;

  let id: string | null = null;
  let type: GoogleDriveResource['type'] = 'generic';
  let icon = 'add_to_drive';
  let typeName = 'Google Drive';

  // 1. Check directories/folders
  // e.g., https://drive.google.com/drive/folders/FILE_ID
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    id = folderMatch[1];
    type = 'folder';
    icon = 'folder_shared';
    typeName = 'Carpeta de Google Drive';
  }

  // 2. Check document
  // e.g., https://docs.google.com/document/d/FILE_ID
  const docMatch = trimmed.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    id = docMatch[1];
    type = 'document';
    icon = 'description';
    typeName = 'Documento de Google Docs';
  }

  // 3. Check spreadsheet
  // e.g., https://docs.google.com/spreadsheets/d/FILE_ID
  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch) {
    id = sheetMatch[1];
    type = 'spreadsheet';
    icon = 'table_chart';
    typeName = 'Planilla de Google Sheets';
  }

  // 4. Check presentation
  // e.g., https://docs.google.com/presentation/d/FILE_ID
  const slideMatch = trimmed.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slideMatch) {
    id = slideMatch[1];
    type = 'presentation';
    icon = 'slideshow';
    typeName = 'Presentación de Google Slides';
  }

  // 5. Standard file views
  // e.g., https://drive.google.com/file/d/FILE_ID/view
  if (!id) {
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      id = fileMatch[1];
      type = 'image'; // Default to standard Google Drive viewer that can be embedded as image
      icon = 'image';
      typeName = 'Archivo de Google Drive';
    }
  }

  // 6. Query parameters
  // e.g., ?id=FILE_ID
  if (!id) {
    const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (queryMatch) {
      id = queryMatch[1];
      type = 'image';
      icon = 'image';
      typeName = 'Archivo de Google Drive';
    }
  }

  if (!id) {
    return {
      id: null,
      type: 'generic',
      previewUrl: null,
      icon: 'link',
      typeName: 'Enlace'
    };
  }

  // Using the Google Usercontent direct thumbnail API to fetch an embeddable image.
  // This avoids frame limitations and is lightweight.
  const previewUrl = type === 'image' ? `https://lh3.googleusercontent.com/d/${id}` : null;

  return {
    id,
    type,
    previewUrl,
    icon,
    typeName
  };
}
