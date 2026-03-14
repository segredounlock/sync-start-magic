-- Grant execute to all roles including service_role used by admin queries
GRANT EXECUTE ON FUNCTION public.get_public_store_by_slug(text) TO PUBLIC;