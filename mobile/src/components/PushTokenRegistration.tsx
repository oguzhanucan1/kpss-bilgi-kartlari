import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerPushTokenForUser } from '../lib/registerPushToken';

export function PushTokenRegistration() {
  const { session } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || registered.current) return;
    let cancelled = false;
    registerPushTokenForUser(userId).then((ok) => {
      if (!cancelled && ok) registered.current = true;
    });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  return null;
}
