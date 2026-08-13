export type Proto = "udp" | "tcp";

export interface PortRow {
    host: string;
    container: string;
    proto: Proto;
    required?: boolean;
}

export interface VolumeRow {
    host: string;
    container: string;
    required?: boolean;
}

export interface EnvRow {
    name: string;
    value: string;
    secret: boolean;
}

export interface Flavor {
    key: string;
    name: string;
    tag: string;
    container: string;
    ports: PortRow[];
    volumes: VolumeRow[];
    env: EnvRow[];
    extraArgs: string;
}

export interface Game {
    key: string;
    name: string;
    flavors: Flavor[];
}

export const GHCR = "ghcr.io/hm-gamesrv";
export const ALIYUN = "crpi-i9e7zrpnu4792a5m.cn-chengdu.personal.cr.aliyuncs.com/hiromuraki";

export const games: Game[] = [
    {
        key: "counter-strike",
        name: "Counter-Strike 1.6 / CS:CZ",
        flavors: [
            {
                key: "1.6-dm",
                name: "CS1.6 死亡竞赛",
                tag: "1.6-dm-latest",
                container: "counter-strike-1.6-dm-server",
                ports: [
                    { host: "27015", container: "27015", proto: "udp", required: true },
                    { host: "27015", container: "27015", proto: "tcp" },
                ],
                volumes: [],
                env: [],
                extraArgs: "",
            },
            {
                key: "1.6-versus",
                name: "CS1.6 对决",
                tag: "1.6-versus-latest",
                container: "counter-strike-1.6-versus-server",
                ports: [
                    { host: "27015", container: "27015", proto: "udp", required: true },
                    { host: "27015", container: "27015", proto: "tcp" },
                ],
                volumes: [],
                env: [],
                extraArgs: "",
            },
            {
                key: "condition-zero-dm",
                name: "CS:CZ 死亡竞赛",
                tag: "condition-zero-dm-latest",
                container: "counter-strike-condition-zero-dm-server",
                ports: [
                    { host: "27015", container: "27015", proto: "udp", required: true },
                    { host: "27015", container: "27015", proto: "tcp" },
                ],
                volumes: [],
                env: [],
                extraArgs: "",
            },
            {
                key: "condition-zero-versus",
                name: "CS:CZ 对决",
                tag: "condition-zero-versus-latest",
                container: "counter-strike-condition-zero-versus-server",
                ports: [
                    { host: "27015", container: "27015", proto: "udp", required: true },
                    { host: "27015", container: "27015", proto: "tcp" },
                ],
                volumes: [],
                env: [],
                extraArgs: "",
            },
        ],
    },
    {
        key: "counter-strike-source",
        name: "Counter-Strike: Source",
        flavors: [
            {
                key: "versus",
                name: "对决",
                tag: "versus-latest",
                container: "counter-strike-source-versus-server",
                ports: [
                    { host: "27015", container: "27015", proto: "udp", required: true },
                    { host: "27015", container: "27015", proto: "tcp" },
                ],
                volumes: [],
                env: [],
                extraArgs: "",
            },
        ],
    },
    {
        key: "cso2",
        name: "Counter-Strike Online 2",
        flavors: [
            {
                key: "default",
                name: "默认",
                tag: "latest",
                container: "counter-strike-online-2-server",
                ports: [
                    { host: "1314", container: "1314", proto: "tcp", required: true },
                    { host: "1315", container: "1315", proto: "tcp", required: true },
                    { host: "30001", container: "30001", proto: "tcp", required: true },
                    { host: "30002", container: "30002", proto: "udp", required: true },
                ],
                volumes: [{ host: "./database", container: "/app/CSO2-Server/database" }],
                env: [],
                extraArgs: "",
            },
        ],
    },
    {
        key: "left-4-dead-2",
        name: "Left 4 Dead 2",
        flavors: [
            {
                key: "latest",
                name: "插件版",
                tag: "latest",
                container: "left-4-dead-2-server",
                ports: [
                    { host: "27015", container: "27015", proto: "udp", required: true },
                    { host: "27015", container: "27015", proto: "tcp" },
                ],
                volumes: [{ host: "./left-4-dead-2-app", container: "/app", required: true }],
                env: [
                    { name: "STEAM_USERNAME", value: "", secret: true },
                    { name: "STEAM_PASSWORD", value: "", secret: true },
                ],
                extraArgs: "",
            },
        ],
    },
    {
        key: "minecraft-casual",
        name: "Minecraft Casual",
        flavors: [
            {
                key: "1.21.1",
                name: "1.21.1",
                tag: "1.21.1-latest",
                container: "minecraft-casual-1.21.1-server",
                ports: [
                    { host: "25565", container: "25565", proto: "tcp", required: true },
                    { host: "25575", container: "25575", proto: "tcp" },
                ],
                volumes: [
                    { host: "./minecraft-casual-1.21.1-data/world", container: "/app/world" },
                    {
                        host: "./minecraft-casual-1.21.1-data/simple_backup",
                        container: "/app/simple_backup",
                    },
                ],
                env: [],
                extraArgs: "",
            },
        ],
    },
    {
        key: "minecraft-gtnh",
        name: "Minecraft GTNH",
        flavors: [
            {
                key: "latest",
                name: "最新",
                tag: "latest",
                container: "minecraft-gtnh-server",
                ports: [
                    { host: "25565", container: "25565", proto: "tcp", required: true },
                    { host: "25575", container: "25575", proto: "tcp" },
                ],
                volumes: [
                    { host: "./minecraft-gtnh-data/World", container: "/app/World" },
                    { host: "./minecraft-gtnh-data/backups", container: "/app/backups" },
                    { host: "./minecraft-gtnh-data/extra-files", container: "/app/extra-files" },
                ],
                env: [],
                extraArgs: "bash",
            },
        ],
    },
    {
        key: "project-zomboid",
        name: "Project Zomboid",
        flavors: [
            {
                key: "latest",
                name: "最新正式版",
                tag: "latest",
                container: "project-zomboid-server",
                ports: [
                    { host: "16261", container: "16261", proto: "udp", required: true },
                    { host: "16262", container: "16262", proto: "udp" },
                ],
                volumes: [
                    { host: "./project-zomboid-app", container: "/app", required: true },
                    { host: "./project-zomboid-data", container: "/data", required: true },
                ],
                env: [],
                extraArgs: "",
            },
        ],
    },
    {
        key: "terraria",
        name: "Terraria",
        flavors: [
            {
                key: "official",
                name: "原版",
                tag: "latest",
                container: "terraria-server",
                ports: [{ host: "7777", container: "7777", proto: "tcp", required: true }],
                volumes: [{ host: "./world", container: "/app/world" }],
                env: [],
                extraArgs: "",
            },
            {
                key: "tshock",
                name: "TShock 插件服",
                tag: "tshock-latest",
                container: "terraria-tshock-server",
                ports: [{ host: "7777", container: "7777", proto: "tcp", required: true }],
                volumes: [{ host: "./tshock", container: "/app/tshock" }],
                env: [],
                extraArgs: "",
            },
        ],
    },
    {
        key: "warfork",
        name: "Warfork",
        flavors: [
            {
                key: "dm",
                name: "死亡竞赛",
                tag: "dm-latest",
                container: "warfork-dm-server",
                ports: [
                    { host: "44400", container: "44400", proto: "udp", required: true },
                    { host: "44444", container: "44444", proto: "tcp" },
                ],
                volumes: [],
                env: [],
                extraArgs: "",
            },
        ],
    },
];
