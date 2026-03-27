import { LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useId, useState, type ChangeEvent } from 'react';
import {
  uploadImageToProjectStorage,
  type LocalImageUploadOptions,
} from '../../lib/imageUpload';
import type { AdminEditorStatusTone } from './useAdminEditorPersistence';

type AdminImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  previewAlt: string;
  helperText?: string;
  emptyText?: string;
  buttonLabel?: string;
  replaceLabel?: string;
  removeLabel?: string;
  fallbackPreviewUrl?: string;
  fieldClassName?: string;
  previewClassName?: string;
  previewWrapperClassName?: string;
  uploadOptions?: LocalImageUploadOptions;
  onUploadStatus?: (message: string, tone?: AdminEditorStatusTone) => void;
};

export default function AdminImageUploadField({
  label,
  value,
  onChange,
  previewAlt,
  helperText,
  emptyText = 'Nenhuma imagem enviada neste campo.',
  buttonLabel = 'Selecionar imagem',
  replaceLabel = 'Trocar imagem',
  removeLabel = 'Remover',
  fallbackPreviewUrl,
  fieldClassName = 'field field-full',
  previewClassName = 'admin-image-upload-main',
  previewWrapperClassName = 'admin-image-upload-preview',
  uploadOptions,
  onUploadStatus,
}: AdminImageUploadFieldProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const previewUrl = value || fallbackPreviewUrl;
  const hasCustomImage = Boolean(value);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const asset = await uploadImageToProjectStorage(file, uploadOptions);
      onChange(asset.url);
      onUploadStatus?.(`Imagem "${asset.fileName}" enviada com sucesso.`, 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel enviar a imagem.';
      setErrorMessage(message);
      onUploadStatus?.(message, 'error');
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    onChange('');
    setErrorMessage('');
    onUploadStatus?.(`Imagem removida do campo "${label}".`, 'info');
  }

  return (
    <div className={fieldClassName}>
      <span className="field-label">{label}</span>
      <div className="card admin-image-upload-card">
        <div className="admin-gallery-header">
          <div>
            <strong>{hasCustomImage ? 'Imagem personalizada salva no formulario' : 'Upload de imagem'}</strong>
            <p className="muted">
              {helperText ||
                'Selecione um arquivo do computador. A URL fica salva automaticamente no dado editado.'}
            </p>
            {errorMessage && <p className="admin-upload-feedback admin-upload-feedback-error">{errorMessage}</p>}
          </div>

          <div className="admin-upload-actions">
            <label htmlFor={inputId} className="button button-outline admin-upload-button">
              {isUploading ? (
                <>
                  <LoaderCircle size={16} className="spin-inline" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {hasCustomImage ? replaceLabel : buttonLabel}
                </>
              )}
            </label>
            <input
              id={inputId}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <button
              type="button"
              className="button button-secondary"
              onClick={handleRemove}
              disabled={isUploading || !hasCustomImage}
            >
              <Trash2 size={16} />
              {removeLabel}
            </button>
          </div>
        </div>

        {previewUrl ? (
          <div className={previewWrapperClassName}>
            <img src={previewUrl} alt={previewAlt} className={previewClassName} />
          </div>
        ) : (
          <div className="card admin-upload-empty">
            <p className="muted">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
