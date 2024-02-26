export class ConfigReader {
    public static instance: Config

    constructor(json: Config) {
        ConfigReader.instance = json
    }
}

export interface Config {
    PORT: number,
    BACKEND_API_PROTOCOL: string,
    BACKEND_API_HOST: string,
    BACKEND_API_PORT: number,
}
