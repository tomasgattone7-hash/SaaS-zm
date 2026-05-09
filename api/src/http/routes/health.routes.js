import { checkDatabaseConnection } from "../../db/client.js";
export const healthRoutes = async (app) => {
    app.get("/health", {
        schema: {
            response: {
                200: {
                    type: "object",
                    required: ["status", "service", "timestamp", "database"],
                    properties: {
                        status: { type: "string" },
                        service: { type: "string" },
                        timestamp: { type: "string", format: "date-time" },
                        database: { type: "string" },
                    },
                },
                503: {
                    type: "object",
                    required: ["status", "service", "timestamp", "database"],
                    properties: {
                        status: { type: "string" },
                        service: { type: "string" },
                        timestamp: { type: "string", format: "date-time" },
                        database: { type: "string" },
                    },
                },
            },
        },
    }, async (_request, reply) => {
        const basePayload = {
            service: "factory-finance-api",
            timestamp: new Date().toISOString(),
        };
        try {
            await checkDatabaseConnection();
            return {
                status: "ok",
                database: "up",
                ...basePayload,
            };
        }
        catch (error) {
            app.log.error({ err: error }, "Database health check failed.");
            reply.code(503);
            return { status: "error", database: "down", ...basePayload };
        }
    });
};
