import { useLocation, useNavigate, useParams as rrUseParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1),
    refresh: () => window.location.reload(),
  } as const;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return rrUseParams() as T;
}

export function usePathname() {
  const { pathname } = useLocation();
  return pathname;
}

export function useSearchParams() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params;
}
