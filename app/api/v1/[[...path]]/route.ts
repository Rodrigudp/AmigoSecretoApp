import { apiError, apiOptions, apiRoute } from "../_lib/http";

const notFound = apiRoute({ auth: "none", operation: "not_found" }, () => apiError("NOT_FOUND"));

export { apiOptions as OPTIONS };
export { notFound as GET, notFound as POST, notFound as PATCH, notFound as DELETE };
export { notFound as PUT, notFound as HEAD };
