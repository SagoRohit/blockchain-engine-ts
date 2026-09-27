import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marks a read-only explorer route as exempt from the global AuthGuard.
// Every request still passes through the guard (auth is "checked" per the
// checklist); this just tells it the route doesn't require a valid token.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
