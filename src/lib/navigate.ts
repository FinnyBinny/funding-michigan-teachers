/** In-app navigation: the Router listens for popstate. */
export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Props for an <a> that navigates in-app. A real link, so it can be opened in
 * a new tab and is announced as a link; a plain click stays in the app, and a
 * modified click (new tab, new window) is left to the browser.
 */
export function navLinkProps(path: string) {
  return {
    href: path,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      navigate(path);
    },
  };
}
