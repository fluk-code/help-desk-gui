export const timeAgo = (timestamp: number | Date | string): string => {
  if (!timestamp) {
    return '';
  }

  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds)) {
    return ''; // Retorna vazio para datas inválidas
  }

  if (seconds < 30) {
    return 'agora';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.round(seconds / 3600);
  if (hours < 24) {
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  }

  const days = Math.round(seconds / 86400);
  if (days < 7) {
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }

  const weeks = Math.round(seconds / (86400 * 7));
  if (weeks < 4) {
    return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }

  const months = Math.round(seconds / (86400 * 30));
  if (months < 12) {
    return `há ${months} mês${months > 1 ? 'es' : ''}`;
  }

  const years = Math.round(seconds / (86400 * 365));
  return `há ${years} ano${years > 1 ? 's' : ''}`;
};
