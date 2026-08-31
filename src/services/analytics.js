import { supabase } from './api';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let sessionId = null;
let userId = null;

const initAnalytics = () => {
  sessionId = generateSessionId();
  userId = generateOrGetUserId();
  
  if (GA_MEASUREMENT_ID) {
    loadGTag();
  }
};

const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const generateOrGetUserId = () => {
  let id = localStorage.getItem('analytics_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('analytics_user_id', id);
  }
  return id;
};

const loadGTag = () => {
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false,
  });
};

const trackEvent = async (eventName, eventData = {}) => {
  const fullEventData = {
    ...eventData,
    session_id: sessionId,
    user_id: userId,
    timestamp: new Date().toISOString(),
  };

  if (GA_MEASUREMENT_ID && window.gtag) {
    const gaParams = {
      ...eventData,
      session_id: sessionId,
    };
    window.gtag('event', eventName, gaParams);
  }

  try {
    await saveEventToSupabase(eventName, fullEventData);
  } catch (err) {
    console.warn('Error saving event to Supabase:', err);
  }
};

const saveEventToSupabase = async (eventName, eventData) => {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('menu_analytics_events')
      .insert([
        {
          event_type: eventName,
          event_data: eventData,
          user_id: userId,
          session_id: sessionId,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.warn('Supabase insert error:', error);
    }
  } catch (err) {
    console.warn('Error with Supabase:', err);
  }
};

export const analytics = {
  init: initAnalytics,
  
  menuView: (businessName, businessSlug, citySlug) => {
    trackEvent('menu_view', {
      business_name: businessName,
      business_slug: businessSlug,
      city_slug: citySlug,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  },

  viewItem: (productId, productName, price, businessName, category) => {
    trackEvent('view_item', {
      item_id: String(productId),
      item_name: productName,
      price: price,
      currency: 'COP',
      business_name: businessName,
      category: category,
    });
  },

  selectCategory: (categoryName, businessName) => {
    trackEvent('select_category', {
      category: categoryName,
      business_name: businessName,
    });
  },

  search: (searchQuery, resultsCount, businessName) => {
    trackEvent('search', {
      search_term: searchQuery,
      results_count: resultsCount,
      business_name: businessName,
    });
  },

  viewCart: (itemCount, cartTotal, businessName) => {
    trackEvent('view_cart', {
      item_count: itemCount,
      value: cartTotal,
      currency: 'COP',
      business_name: businessName,
    });
  },

  addToCart: (productId, productName, quantity, price, businessName) => {
    trackEvent('add_to_cart', {
      item_id: String(productId),
      item_name: productName,
      quantity: quantity,
      price: price,
      currency: 'COP',
      business_name: businessName,
    });
  },

  removeFromCart: (productId, productName, businessName) => {
    trackEvent('remove_from_cart', {
      item_id: String(productId),
      item_name: productName,
      business_name: businessName,
    });
  },

  beginCheckout: (itemCount, cartTotal, paymentMethod, businessName) => {
    trackEvent('begin_checkout', {
      item_count: itemCount,
      value: cartTotal,
      currency: 'COP',
      payment_method: paymentMethod,
      business_name: businessName,
    });
  },

  orderValidated: (itemCount, orderTotal, paymentMethod, businessName) => {
    trackEvent('order_validated', {
      item_count: itemCount,
      value: orderTotal,
      currency: 'COP',
      payment_method: paymentMethod,
      business_name: businessName,
    });
  },

  orderRecorded: (orderId, itemCount, orderTotal, paymentMethod, businessName) => {
    trackEvent('order_recorded', {
      order_id: String(orderId),
      item_count: itemCount,
      value: orderTotal,
      currency: 'COP',
      payment_method: paymentMethod,
      business_name: businessName,
    });
  },

  whatsappClick: (itemCount, orderTotal, businessName) => {
    trackEvent('whatsapp_order_click', {
      item_count: itemCount,
      value: orderTotal,
      currency: 'COP',
      business_name: businessName,
    });
  },

  businessInfoView: (businessName) => {
    trackEvent('business_info_view', {
      business_name: businessName,
    });
  },

  cartAbandoned: (itemCount, cartTotal, businessName) => {
    trackEvent('cart_abandoned', {
      item_count: itemCount,
      value: cartTotal,
      currency: 'COP',
      business_name: businessName,
    });
  },

  sessionEnd: (sessionDuration, businessName) => {
    trackEvent('session_end', {
      session_duration: sessionDuration,
      business_name: businessName,
    });
  },
};