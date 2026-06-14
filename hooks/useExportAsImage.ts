import { toPng } from 'html-to-image';

export const useExportAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // Mejora la calidad
      cacheBust: true, // Evita problemas de caché de imágenes
      skipAutoScale: true, // CRÍTICO: Evita que recorte elementos por "escala"
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error al exportar:', err);
  }
};