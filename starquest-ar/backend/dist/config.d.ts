export declare const config: {
    mongodb: {
        uri: string;
    };
    server: {
        port: number;
        nodeEnv: string;
        clientUrl: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    web3: {
        rpcUrl: string;
        privateKey: string;
        contractAddress: string;
    };
    ar: {
        apiKey: string;
        serviceUrl: string;
    };
    firebase: {
        projectId: string;
        privateKey: string;
        clientEmail: string;
    };
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
};
//# sourceMappingURL=config.d.ts.map