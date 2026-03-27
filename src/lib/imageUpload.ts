export type LocalImageUploadOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export type UploadedImageAsset = {
  fileName: string;
  mimeType: string;
  uploadedAt: string;
  url: string;
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
      reject(new Error('Nao foi possivel carregar a imagem.'));
    };

    reader.readAsDataURL(file);
  });
}

function loadImageElement(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Nao foi possivel processar a imagem selecionada.'));
    image.src = source;
  });
}

function getResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export async function processLocalImageUpload(
  file: File,
  options: LocalImageUploadOptions = {}
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem valido.');
  }

  const maxWidth = options.maxWidth ?? 1600;
  const maxHeight = options.maxHeight ?? 1600;
  const quality = options.quality ?? 0.84;

  const source = await readFileAsDataUrl(file);
  const image = await loadImageElement(source);
  const { width, height } = getResizedDimensions(
    image.width,
    image.height,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Nao foi possivel preparar a imagem para upload.');
  }

  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}

export async function uploadImageToProjectStorage(
  file: File,
  options: LocalImageUploadOptions = {}
): Promise<UploadedImageAsset> {
  const url = await processLocalImageUpload(file, options);

  return {
    fileName: file.name,
    mimeType: 'image/jpeg',
    uploadedAt: new Date().toISOString(),
    url,
  };
}
