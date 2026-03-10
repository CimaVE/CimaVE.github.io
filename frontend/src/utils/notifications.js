// Push Notifications Utility

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    tag: 'cima-notification',
    requireInteraction: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) {
        options.onClick();
      }
    };

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

export const showPriceAlert = (symbol, currentPrice, alertType, threshold) => {
  const direction = alertType === 'price_above' ? 'subió' : 'bajó';
  const emoji = alertType === 'price_above' ? '📈' : '📉';
  
  showNotification(`${emoji} Alerta de precio: ${symbol}`, {
    body: `${symbol} ${direction} a $${currentPrice.toLocaleString()}. Tu alerta estaba configurada en $${threshold.toLocaleString()}.`,
    tag: `price-alert-${symbol}`,
    requireInteraction: true,
    onClick: () => {
      window.location.href = '/alerts';
    }
  });
};

export const showGoalProgress = (goalTitle, currentAmount, targetAmount) => {
  const progress = Math.round((currentAmount / targetAmount) * 100);
  
  showNotification(`🎯 Progreso en tu objetivo`, {
    body: `"${goalTitle}" está al ${progress}%. ¡Sigue así!`,
    tag: `goal-progress-${goalTitle}`,
  });
};

export const showGoalCompleted = (goalTitle) => {
  showNotification(`🎉 ¡Objetivo completado!`, {
    body: `Felicidades, completaste tu objetivo "${goalTitle}".`,
    tag: `goal-completed-${goalTitle}`,
    requireInteraction: true,
  });
};

// Check alerts against current prices
export const checkAlerts = async (alerts, stocks, cryptos) => {
  if (Notification.permission !== 'granted') return;
  
  const getPrice = (symbol) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) return stock.price;
    
    const crypto = cryptos.find(c => c.symbol === symbol);
    if (crypto) return crypto.price;
    
    return null;
  };

  alerts.forEach(alert => {
    if (!alert.is_active || alert.triggered) return;
    
    const currentPrice = getPrice(alert.symbol);
    if (!currentPrice) return;
    
    const shouldTrigger = alert.alert_type === 'price_above' 
      ? currentPrice >= alert.threshold
      : currentPrice <= alert.threshold;
    
    if (shouldTrigger) {
      showPriceAlert(alert.symbol, currentPrice, alert.alert_type, alert.threshold);
    }
  });
};

// Register service worker for background notifications (optional enhancement)
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};
