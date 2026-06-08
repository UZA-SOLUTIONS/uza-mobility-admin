/** Whether a marketing nav item should show as the current page. */
export function isMarketingNavItemActive(
  pathname: string,
  href: string,
): boolean {
  const path = pathname.split('?')[0] || '/';
  const target = href.split('?')[0] || '/';

  if (target === '/') {
    return path === '/';
  }

  if (target === '/vehicles' || target.startsWith('/vehicles/')) {
    return path === '/vehicles' || path.startsWith('/vehicles/');
  }

  if (target === '/spare-parts' || target.startsWith('/spare-parts')) {
    return path === '/spare-parts' || path.startsWith('/spare-parts');
  }

  return path === target || path.startsWith(`${target}/`);
}
