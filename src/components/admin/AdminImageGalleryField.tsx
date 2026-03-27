import { LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useId, useState, type ChangeEvent } from 'react';
import {
  uploadImageToProjectStorage,
  type LocalImageUploadOptions,
} from '../../lib/imageUpload';
import type { AdminEditorStatusTone } from './useAdminEditorPersistence';

type AdminImageGalleryFieldProps = {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  helperText?: string;
  emptyText?: string;
  addLabel?: string;
  replaceLabel?: string;
  removeLabel?: string;
  itemName?: string;
  fieldClassName?: string;
  previewClassName?: string;
  uploadOptions?: LocalImageUploadOptions;
  onUploadStatus?: (message: string, tone?: AdminEditorStatusTone) => void;
};

export default function AdminImageGalleryField({
  label,
  images,
  onChange,
  helperText,
  emptyText = 'Nenhuma imagem adicionada ainda.',
  addLabel = 'Adicionar imagens',
  replaceLabel = 'Trocar',
  removeLabel = 'Remover',
  itemName = 'Imagem',
  fieldClassName = 'field field-full',
  previewClassName = 'admin-upload-thumb',
  uploadOptions,
  onUploadStatus,
}: AdminImageGalleryFieldProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleAddImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) {
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const uploadedImages = await Promise.all(
        files.map((file) => uploadImageToProjectStorage(file, uploadOptions))
      );
      onChange([...images, ...uploadedImages.map((asset) => asset.url)]);
      onUploadStatus?.(
        `${uploadedImages.length} imagem(ns) adicionada(s) em "${label}".`,
        'success'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel enviar as imagens.';
      setErrorMessage(message);
      onUploadStatus?.(message, 'error');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleReplaceImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setReplacingIndex(index);
    setErrorMessage('');

    try {
      const asset = await uploadImageToProjectStorage(file, uploadOptions);
      onChange(images.map((image, currentIndex) => (currentIndex === index ? asset.url : image)));
      onUploadStatus?.(`${itemName} ${index + 1} atualizada com sucesso.`, 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel atualizar a imagem.';
      setErrorMessage(message);
      onUploadStatus?.(message, 'error');
    } finally {
      setReplacingIndex(null);
    }
  }

  function handleRemoveImage(index: number) {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
    setErrorMessage('');
    onUploadStatus?.(`${itemName} ${index + 1} removida.`, 'info');
  }

  return (
    <div className={fieldClassName}>
      <span className="field-label">{label}</span>
      <div className="card admin-gallery-manager">
        <div className="admin-gallery-header">
          <div>
            <strong>{label}</strong>
            <p className="muted">
              {helperText ||
                'Envie uma ou mais imagens do computador. A ordem de exibicao acompanha a ordem desta grade.'}
            </p>
            {errorMessage && <p className="admin-upload-feedback admin-upload-feedback-error">{errorMessage}</p>}
          </div>

          <label htmlFor={inputId} className="button button-outline admin-upload-button">
            {isUploading ? (
              <>
                <LoaderCircle size={16} className="spin-inline" />
                Enviando...
              </>
            ) : (
              <>
                <Upload size={16} />
                {addLabel}
              </>
            )}
          </label>
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddImages}
            disabled={isUploading}
          />
        </div>

        <div className="admin-upload-grid">
          {images.length === 0 && (
            <div className="card admin-upload-empty">
              <p className="muted">{emptyText}</p>
            </div>
          )}

          {images.map((imageUrl, index) => {
            const replaceInputId = `${inputId}-${index}`;
            const isReplacing = replacingIndex === index;

            return (
              <article key={`${imageUrl}-${index}`} className="card admin-upload-item">
                <img src={imageUrl} alt={`${itemName} ${index + 1}`} className={previewClassName} />
                <div className="admin-inline-actions">
                  <strong>
                    {itemName} {index + 1}
                  </strong>

                  <div className="admin-upload-actions">
                    <label
                      htmlFor={replaceInputId}
                      className="button button-outline admin-upload-button"
                    >
                      {isReplacing ? (
                        <>
                          <LoaderCircle size={16} className="spin-inline" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          {replaceLabel}
                        </>
                      )}
                    </label>
                    <input
                      id={replaceInputId}
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleReplaceImage(index, event)}
                      disabled={isReplacing}
                    />
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isReplacing}
                    >
                      <Trash2 size={16} />
                      {removeLabel}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
