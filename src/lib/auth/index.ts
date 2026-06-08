/** Server-safe: session middleware, route handler, redirects. */
export { auth, handlers, signIn, signOut } from './next-auth';
export {
  authRedirect,
  canAccessWorkspacePath,
  resolvePostLoginRedirect,
} from './redirect';
