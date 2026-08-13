<template>
    <div class="flex h-full w-full min-h-0 text-gray-800 font-sans box-border">
        <div class="w-1/2 p-8 overflow-y-auto border-r border-gray-200 box-border">
            <div class="mb-4 flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
                <h2 class="mt-0 text-xl font-semibold">游戏服务器启动脚本</h2>
                <button
                    class="shrink-0 rounded-md border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-sky-700 hover:bg-sky-700"
                    @click="resetConfig"
                >
                    重置
                </button>
            </div>

            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold mb-1.5 text-gray-600">游戏</label>
                    <select
                        v-model="config.selectedGameKey"
                        @change="onGameChange"
                        class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm transition-colors focus:outline-none focus:border-black"
                    >
                        <option v-for="game in games" :key="game.key" :value="game.key">
                            {{ game.name }}
                        </option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1.5 text-gray-600">风味</label>
                    <select
                        v-model="config.selectedFlavorKey"
                        @change="loadFlavor"
                        class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm transition-colors focus:outline-none focus:border-black"
                    >
                        <option v-for="flavor in activeGame?.flavors ?? []" :key="flavor.key" :value="flavor.key">
                            {{ flavor.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-semibold mb-1.5 text-gray-600">实例序号</label>
                    <input
                        v-model.number="config.instance"
                        type="number"
                        min="1"
                        class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm transition-colors focus:outline-none focus:border-black"
                    />
                    <p class="mt-1 text-xs text-gray-400">
                        &gt;1 时容器名/卷路径加 -N，主机端口 +N-1（多实例靠卷隔离）
                    </p>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1.5 text-gray-600">容器名</label>
                    <input
                        v-model="config.containerName"
                        class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                    />
                </div>
            </div>

            <div class="mb-4 flex items-center gap-2">
                <input id="prefetch" v-model="config.prefetch" type="checkbox" class="h-4 w-4" />
                <label for="prefetch" class="text-sm font-semibold text-gray-600">预取阿里云镜像</label>
            </div>

            <h3 class="text-base font-semibold my-4 text-gray-600">端口</h3>
            <div v-for="(row, index) in config.ports" :key="'p' + index" class="flex gap-2 mb-2.5 items-center">
                <input
                    v-model="row.host"
                    placeholder="主机端口"
                    class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
                <input
                    v-model="row.container"
                    placeholder="容器端口"
                    :readonly="row.required"
                    class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black read-only:cursor-not-allowed read-only:bg-gray-100 read-only:text-gray-400"
                />
                <select
                    v-model="row.proto"
                    :disabled="row.required"
                    class="p-2.5 border border-gray-300 rounded-md box-border text-sm transition-colors focus:outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                    <option value="udp">udp</option>
                    <option value="tcp">tcp</option>
                </select>
                <span
                    v-if="row.required"
                    class="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"
                >
                    必需
                </span>
                <button
                    v-if="!row.required"
                    class="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600"
                    @click="removePort(index)"
                >
                    删除
                </button>
            </div>
            <button
                class="w-full px-4 py-2 bg-white border border-dashed border-gray-300 rounded-md cursor-pointer text-sm font-semibold transition-colors text-gray-600 mt-1 hover:border-black hover:text-black"
                @click="addPort"
            >
                + 添加端口
            </button>

            <h3 class="text-base font-semibold my-4 text-gray-600">卷</h3>
            <div v-for="(row, index) in config.volumes" :key="'v' + index" class="flex gap-2 mb-2.5 items-center">
                <input
                    v-model="row.host"
                    placeholder="./data"
                    class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
                <input
                    v-model="row.container"
                    placeholder="/app"
                    :readonly="row.required"
                    class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black read-only:cursor-not-allowed read-only:bg-gray-100 read-only:text-gray-400"
                />
                <span
                    v-if="row.required"
                    class="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"
                >
                    必需
                </span>
                <button
                    v-if="!row.required"
                    class="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors cursor-pointer hover:bg-red-600 hover:text-white hover:border-red-600"
                    @click="removeVolume(index)"
                >
                    删除
                </button>
            </div>
            <button
                class="w-full px-4 py-2 bg-white border border-dashed border-gray-300 rounded-md cursor-pointer text-sm font-semibold transition-colors text-gray-600 mt-1 hover:border-black hover:text-black"
                @click="addVolume"
            >
                + 添加卷
            </button>

            <h3 class="text-base font-semibold my-4 text-gray-600">环境变量</h3>
            <div v-for="(row, index) in config.env" :key="'e' + index" class="flex gap-2 mb-2.5 items-center">
                <input
                    v-model="row.name"
                    placeholder="VAR_NAME"
                    class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
                <input
                    v-model="row.value"
                    :type="row.secret ? 'password' : 'text'"
                    placeholder="值"
                    class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
                <label class="flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500">
                    <input v-model="row.secret" type="checkbox" class="h-4 w-4" />
                    敏感
                </label>
                <button
                    class="px-3 py-1.5 text-red-600 border border-red-200 bg-white rounded-md cursor-pointer text-xs font-semibold transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                    @click="removeEnv(index)"
                >
                    删除
                </button>
            </div>
            <button
                class="w-full px-4 py-2 bg-white border border-dashed border-gray-300 rounded-md cursor-pointer text-sm font-semibold transition-colors text-gray-600 mt-1 hover:border-black hover:text-black"
                @click="addEnv"
            >
                + 添加环境变量
            </button>
            <p class="mt-1 text-xs text-gray-400">
                勾选"敏感"的变量不写入脚本，生成 ${NAME:?未设置} 占位，运行时从 shell 环境读取。
            </p>

            <h3 class="text-base font-semibold my-4 text-gray-600">附加参数</h3>
            <input
                v-model="config.extraArgs"
                placeholder="如 bash（GTNH 进 shell）"
                class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
            />

            <div class="mt-5 space-y-1.5">
                <p
                    v-for="(msg, index) in validationMessages"
                    :key="index"
                    class="rounded-md px-3 py-2 text-xs font-semibold"
                    :class="msgClass(msg.kind)"
                >
                    {{ msg.text }}
                </p>
            </div>
            <div class="h-12"></div>
        </div>

        <div class="w-1/2 p-8 bg-gray-50 overflow-y-auto box-border flex flex-col min-h-0">
            <div class="mb-4 flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
                <h2 class="mt-0 text-xl font-semibold">启动脚本预览</h2>
                <div class="flex gap-2">
                    <button
                        class="shrink-0 rounded-md border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-sky-700 hover:bg-sky-700"
                        @click="copyScript"
                    >
                        复制
                    </button>
                    <button
                        class="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100"
                        @click="downloadScript"
                    >
                        下载 .sh
                    </button>
                </div>
            </div>
            <pre
                class="bg-white p-5 rounded-lg border border-gray-200 font-mono text-sm leading-relaxed overflow-x-auto grow whitespace-pre-wrap break-words shadow-inner"
                >{{ generatedScript }}</pre
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import {
    ALIYUN,
    GHCR,
    games,
    type EnvRow,
    type Flavor,
    type Game,
    type PortRow,
    type VolumeRow,
} from "./games";

interface GeneratorState {
    selectedGameKey: string;
    selectedFlavorKey: string;
    containerName: string;
    ports: PortRow[];
    volumes: VolumeRow[];
    env: EnvRow[];
    extraArgs: string;
    prefetch: boolean;
    instance: number;
}

interface ValidationMessage {
    kind: "error" | "warning" | "ok";
    text: string;
}

const STORAGE_KEY = "hm-tools.gamesrv-launch-script-generator";

const createDefaultState = (): GeneratorState => ({
    selectedGameKey: games[0]!.key,
    selectedFlavorKey: games[0]!.flavors[0]!.key,
    containerName: "",
    ports: [],
    volumes: [],
    env: [],
    extraArgs: "",
    prefetch: true,
    instance: 1,
});

const config = reactive<GeneratorState>(createDefaultState());

const activeGame = computed<Game | undefined>(() =>
    games.find((game) => game.key === config.selectedGameKey),
);

const activeFlavor = computed<Flavor | undefined>(() =>
    activeGame.value?.flavors.find((flavor) => flavor.key === config.selectedFlavorKey),
);

const loadFlavor = () => {
    const flavor = activeFlavor.value;
    if (!flavor) return;
    config.containerName = flavor.container;
    config.ports = flavor.ports.map((port) => ({ ...port }));
    config.volumes = flavor.volumes.map((volume) => ({ ...volume }));
    config.env = flavor.env.map((item) => ({ ...item }));
    config.extraArgs = flavor.extraArgs;
};

const onGameChange = () => {
    const firstFlavor = activeGame.value?.flavors[0];
    if (firstFlavor) config.selectedFlavorKey = firstFlavor.key;
    loadFlavor();
};

const addPort = () => config.ports.push({ host: "", container: "", proto: "tcp" });
const removePort = (index: number) => config.ports.splice(index, 1);
const addVolume = () => config.volumes.push({ host: "", container: "" });
const removeVolume = (index: number) => config.volumes.splice(index, 1);
const addEnv = () => config.env.push({ name: "", value: "", secret: false });
const removeEnv = (index: number) => config.env.splice(index, 1);

const resetConfig = () => {
    config.prefetch = true;
    config.instance = 1;
    loadFlavor();
};

const instanceNumber = computed(() => {
    const value = Math.trunc(Number(config.instance));
    return Number.isFinite(value) && value > 1 ? value : 1;
});

const instanceSuffix = computed(() => (instanceNumber.value > 1 ? `-${instanceNumber.value}` : ""));

const generatedScript = computed(() => {
    const game = activeGame.value;
    const flavor = activeFlavor.value;
    if (!game || !flavor) return "";

    const inst = instanceNumber.value;
    const suffix = instanceSuffix.value;
    const lines: string[] = ["#!/bin/bash", "set -euo pipefail", ""];

    if (config.prefetch) {
        lines.push(`podman pull ${ALIYUN}/${game.key}:${flavor.tag}`, "");
    }
    lines.push(
        `IMAGE=${GHCR}/${game.key}:${flavor.tag}`,
        "",
        'if ! podman pull "$IMAGE"; then',
        "    exit 1",
        "fi",
        "",
    );

    const run: string[] = [
        "podman run --rm -it",
        `    --name ${config.containerName}${suffix}`,
        "    --userns keep-id",
        "    --network pasta",
    ];

    for (const row of config.ports) {
        if (!row.host || !row.container) continue;
        const hostNumber = Number(row.host);
        const host = inst > 1 && Number.isFinite(hostNumber) ? String(hostNumber + inst - 1) : row.host;
        run.push(`    -p ${host}:${row.container}/${row.proto}`);
    }

    for (const row of config.volumes) {
        if (!row.host || !row.container) continue;
        const host = inst > 1 ? `${row.host}${suffix}` : row.host;
        run.push(`    -v ${host}:${row.container}`);
    }

    for (const row of config.env) {
        const name = row.name.trim();
        if (!name) continue;
        if (row.secret) {
            run.push(`    -e ${name}="\${${name}:?未设置 ${name} 环境变量}"`);
        } else if (row.value !== "") {
            run.push(`    -e ${name}=${row.value}`);
        }
    }

    run.push(`    "$IMAGE"${config.extraArgs ? ` ${config.extraArgs}` : ""}`);
    lines.push(run.join(" \\\n"));
    return lines.join("\n") + "\n";
});

const validationMessages = computed<ValidationMessage[]>(() => {
    const messages: ValidationMessage[] = [];

    if (!config.containerName.trim()) {
        messages.push({ kind: "error", text: "容器名为空" });
    }

    const mounted = new Set(config.volumes.map((volume) => volume.container));
    for (const required of activeFlavor.value?.volumes.filter((volume) => volume.required) ?? []) {
        if (!mounted.has(required.container)) {
            messages.push({ kind: "error", text: `必需卷 ${required.container} 不能移除` });
        }
    }

    const mountedPorts = new Set(
        config.ports.map((port) => `${port.container}:${port.proto}`),
    );
    for (const required of activeFlavor.value?.ports.filter((port) => port.required) ?? []) {
        if (!mountedPorts.has(`${required.container}:${required.proto}`)) {
            messages.push({
                kind: "error",
                text: `必需端口 ${required.container}/${required.proto} 不能移除`,
            });
        }
    }

    const seen = new Set<string>();
    for (const row of config.ports) {
        if (!row.host) continue;
        const key = `${row.host}:${row.proto}`;
        if (seen.has(key)) {
            messages.push({ kind: "warning", text: `主机端口 ${key} 重复` });
        }
        seen.add(key);
    }

    for (const row of config.env) {
        if (row.name.trim() && !row.secret && row.value === "") {
            messages.push({
                kind: "warning",
                text: `环境变量 ${row.name.trim()} 未填值（可勾选"敏感"改为运行时读取）`,
            });
        }
    }

    if (messages.length === 0) {
        messages.push({ kind: "ok", text: "校验通过" });
    }
    return messages;
});

const msgClass = (kind: ValidationMessage["kind"]): string =>
    ({
        error: "bg-red-50 text-red-600",
        warning: "bg-amber-50 text-amber-600",
        ok: "bg-emerald-50 text-emerald-600",
    })[kind];

const fileName = computed(
    () => `start-${config.selectedGameKey}-${config.selectedFlavorKey}${instanceSuffix.value}.sh`,
);

const copyScript = async () => {
    try {
        await navigator.clipboard.writeText(generatedScript.value);
    } catch (error) {
        console.error(error);
    }
};

const downloadScript = () => {
    const blob = new Blob([generatedScript.value], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.value;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

const loadConfig = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        loadFlavor();
        return;
    }

    try {
        const saved = JSON.parse(raw) as Partial<GeneratorState>;

        if (saved.selectedGameKey && games.some((game) => game.key === saved.selectedGameKey)) {
            config.selectedGameKey = saved.selectedGameKey;
        }
        const game = activeGame.value;
        if (
            game &&
            saved.selectedFlavorKey &&
            game.flavors.some((flavor) => flavor.key === saved.selectedFlavorKey)
        ) {
            config.selectedFlavorKey = saved.selectedFlavorKey;
        }

        if (Array.isArray(saved.ports)) {
            config.ports = saved.ports.map((port) => ({
                host: String(port.host ?? ""),
                container: String(port.container ?? ""),
                proto: port.proto === "udp" ? "udp" : "tcp",
                required:
                    activeFlavor.value?.ports.some(
                        (item) =>
                            item.required &&
                            item.container === port.container &&
                            item.proto === port.proto,
                    ) ?? false,
            }));
        }
        if (Array.isArray(saved.volumes)) {
            config.volumes = saved.volumes.map((volume) => ({
                host: String(volume.host ?? ""),
                container: String(volume.container ?? ""),
                required:
                    activeFlavor.value?.volumes.some(
                        (item) => item.required && item.container === volume.container,
                    ) ?? false,
            }));
        }
        if (Array.isArray(saved.env)) {
            config.env = saved.env.map((item) => ({
                name: String(item.name ?? ""),
                value: String(item.value ?? ""),
                secret: Boolean(item.secret),
            }));
        }

        config.containerName = typeof saved.containerName === "string" ? saved.containerName : "";
        config.extraArgs = typeof saved.extraArgs === "string" ? saved.extraArgs : "";
        config.prefetch = typeof saved.prefetch === "boolean" ? saved.prefetch : true;
        config.instance =
            typeof saved.instance === "number" && Number.isFinite(saved.instance)
                ? saved.instance
                : 1;
    } catch (error) {
        console.error(error);
        loadFlavor();
    }
};

watch(
    config,
    () => {
        saveConfig();
    },
    { deep: true },
);

onMounted(loadConfig);
</script>
