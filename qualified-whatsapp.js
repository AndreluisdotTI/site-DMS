let qualifiedWhatsAppTracked = false;

function resetQualifiedWhatsAppTracking() {
  qualifiedWhatsAppTracked = false;
}

function openQualifiedWhatsApp(message) {
  const chat = window.open('about:blank', '_blank');
  if (!chat) {
    window.alert('Permita a abertura de uma nova aba e tente abrir o WhatsApp novamente.');
    return false;
  }

  chat.opener = null;
  chat.location.replace('https://wa.me/558004000442?text=' + encodeURIComponent(message));

  if (!qualifiedWhatsAppTracked && typeof window.gtag === 'function') {
    qualifiedWhatsAppTracked = true;
    window.gtag('event', 'conversion', {
      send_to: 'AW-18557775987/zqdYCM-Pr7UdEPPghJFF'
    });
  }
  return true;
}
