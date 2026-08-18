export type Proto = "udp" | "tcp";

export interface PortRow {
    host: string;
    container: string;
    proto: Proto;
    required?: boolean;
    desc?: string;
}

export interface VolumeRow {
    host: string;
    container: string;
    required?: boolean;
    desc?: string;
}

export interface EnvRow {
    name: string;
    value: string;
    secret: boolean;
    desc?: string;
}

export interface FlavorResources {
    ports: PortRow[];
    volumes: VolumeRow[];
    env: EnvRow[];
    extraArgs: string;
}

export interface Variant {
    key: string;
    name: string;
    tag: string;
    container: string;
    /**
     * 方案 A：variant 未提供某字段则继承主 resources；
     * 提供则 ports / volumes / env / extraArgs 整组替换。
     */
    resources?: Partial<FlavorResources>;
}

export interface GameInfo {
    schemaVersion: number;
    key: string;
    name: string;
    registries?: {
        ghcr?: string;
        aliyun?: string;
    };
    resources: FlavorResources;
    variants: Variant[];
}

export interface GameRepo {
    key: string;
    name: string;
    url: string;
}

export const DEFAULT_REGISTRIES = {
    ghcr: "ghcr.io/hm-gamesrv",
    aliyun: "crpi-i9e7zrpnu4792a5m.cn-chengdu.personal.cr.aliyuncs.com/hiromuraki",
};

export const gameRepos: GameRepo[] = [
    {
        key: "counter-strike",
        name: "Counter-Strike 1.6 / CS:CZ",
        url: "https://github.com/hm-gamesrv/counter-strike",
    },
    {
        key: "counter-strike-online-2",
        name: "Counter-Strike: Online 2",
        url: "https://github.com/hm-gamesrv/counter-strike-online-2",
    },
    {
        key: "counter-strike-source",
        name: "Counter-Strike: Source",
        url: "https://github.com/hm-gamesrv/counter-strike-source",
    },
    {
        key: "counter-strike-global-offensive",
        name: "Counter-Strike: Global Offensive",
        url: "https://github.com/hm-gamesrv/counter-strike-global-offensive",
    },
    {
        key: "left-4-dead-2",
        name: "Left 4 Dead 2",
        url: "https://github.com/hm-gamesrv/left-4-dead-2",
    },
    {
        key: "minecraft-casual",
        name: "Minecraft Casual",
        url: "https://github.com/hm-gamesrv/minecraft-casual",
    },
    {
        key: "minecraft-gtnh",
        name: "Minecraft GTNH",
        url: "https://github.com/hm-gamesrv/minecraft-gtnh",
    },
    {
        key: "project-zomboid",
        name: "Project Zomboid",
        url: "https://github.com/hm-gamesrv/project-zomboid",
    },
    {
        key: "terraria",
        name: "Terraria",
        url: "https://github.com/hm-gamesrv/terraria",
    },
    {
        key: "warfork",
        name: "Warfork",
        url: "https://github.com/hm-gamesrv/warfork",
    },
];

export const toRawInfoUrl = (repoUrl: string): string => {
    const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
    if (!match) throw new Error(`无法解析仓库地址: ${repoUrl}`);
    return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/main/info.json`;
};

export const normalizeRegistry = (base: string | undefined, fallback: string): string =>
    (base ?? fallback).replace(/\/+$/, "");

export const mergeResources = (
    base: FlavorResources,
    override?: Partial<FlavorResources>,
): FlavorResources => ({
    ports: override?.ports ?? base.ports,
    volumes: override?.volumes ?? base.volumes,
    env: override?.env ?? base.env,
    extraArgs: override?.extraArgs ?? base.extraArgs,
});
