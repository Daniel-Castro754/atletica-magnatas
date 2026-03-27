export type UploadedFileAsset = {
  fileName: string;
  mimeType: string;
  uploadedAt: string;
  size: number;
  url: string;
};

export type LocalFileUploadOptions = {
  maxSizeMb?: number;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Nao foi possivel ler o arquivo selecionado.'));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('Nao foi possivel carregar o arquivo selecionado.'));
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadFileToProjectStorage(
  file: File,
  options: LocalFileUploadOptions = {}
): Promise<UploadedFileAsset> {
  const maxSizeMb = options.maxSizeMb ?? 1.2;
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(
      `O arquivo excede o limite de ${maxSizeMb.toFixed(1)} MB. Use um link externo para arquivos maiores.`
    );
  }

  const url = await readFileAsDataUrl(file);

  return {
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    size: file.size,
    url,
  };
}
