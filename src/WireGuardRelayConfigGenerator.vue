<template>
    <div class="flex h-full w-full min-h-0 text-gray-800 font-sans box-border">
        <div class="w-1/2 p-8 overflow-y-auto border-r border-gray-200 box-border">
            <div class="mb-4 flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
                <h2 class="mt-0 text-xl font-semibold">WireGuard 接口配置 (Interface)</h2>
                <button
                    class="shrink-0 rounded-md border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-sky-700 hover:bg-sky-700"
                    @click="resetConfig"
                >
                    重置
                </button>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                    >Address (主机 IP)</label
                >
                <div class="flex items-center gap-2">
                    <input
                        type="text"
                        v-model="config.host"
                        placeholder="例如: 10.8.0.1"
                        class="min-w-0 flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                    />
                    <span class="shrink-0 rounded-md bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500">
                        /24
                    </span>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                    >ListenPort (监听端口)</label
                >
                <input
                    type="number"
                    v-model.number="config.port"
                    class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-1.5 text-gray-600">MTU</label>
                <input
                    type="number"
                    v-model.number="config.mtu"
                    class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                    >PrivateKey (私钥)</label
                >
                <input
                    type="text"
                    v-model="config.privateKey"
                    @input="derivePublicKey"
                    class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                />
                <button
                    class="mt-2 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md cursor-pointer font-semibold transition-colors hover:bg-gray-100"
                    @click="generateKeys"
                >
                    重新生成密钥对
                </button>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                    >PublicKey (公钥 - 由私钥自动生成)</label
                >
                <div class="flex items-center gap-2">
                    <input
                        type="text"
                        v-model="config.publicKey"
                        readonly
                        class="min-w-0 flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <button
                        class="shrink-0 rounded-md border border-sky-600 bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-sky-700 hover:bg-sky-700"
                        type="button"
                        @click="copyPublicKey"
                    >
                        复制
                    </button>
                </div>
            </div>

            <h3 class="text-base font-semibold my-4 text-gray-600">PostUp 规则</h3>
            <div class="mb-5">
                <div
                    class="flex gap-2 mb-2.5 items-center"
                    v-for="(_, index) in config.postUp"
                    :key="'up' + index"
                >
                    <input
                        type="text"
                        v-model="config.postUp[index]"
                        class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                    />
                    <button
                        class="px-3 py-1.5 text-red-600 border border-red-200 bg-white rounded-md cursor-pointer text-xs font-semibold transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                        @click="removePostUp(index)"
                    >
                        删除
                    </button>
                </div>
                <button
                    class="w-full px-4 py-2 bg-white border border-dashed border-gray-300 rounded-md cursor-pointer text-sm font-semibold transition-colors text-gray-600 mt-1 hover:border-black hover:text-black"
                    @click="addPostUp"
                >
                    + 添加 PostUp 规则
                </button>
            </div>

            <h3 class="text-base font-semibold my-4 text-gray-600">PostDown 规则</h3>
            <div class="mb-5">
                <div
                    class="flex gap-2 mb-2.5 items-center"
                    v-for="(_, index) in config.postDown"
                    :key="'down' + index"
                >
                    <input
                        type="text"
                        v-model="config.postDown[index]"
                        class="flex-1 p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                    />
                    <button
                        class="px-3 py-1.5 text-red-600 border border-red-200 bg-white rounded-md cursor-pointer text-xs font-semibold transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                        @click="removePostDown(index)"
                    >
                        删除
                    </button>
                </div>
                <button
                    class="w-full px-4 py-2 bg-white border border-dashed border-gray-300 rounded-md cursor-pointer text-sm font-semibold transition-colors text-gray-600 mt-1 hover:border-black hover:text-black"
                    @click="addPostDown"
                >
                    + 添加 PostDown 规则
                </button>
            </div>

            <h2 class="mt-0 text-xl font-semibold pb-2 border-b border-gray-200 mb-4">
                对等节点 (Peers)
            </h2>
            <div
                class="border border-gray-200 p-5 rounded-lg mb-4 bg-white shadow-sm"
                v-for="(peer, index) in config.peers"
                :key="peer.id"
            >
                <div
                    class="group mb-4 flex cursor-pointer items-center justify-between gap-3 border-b border-dashed border-gray-200 pb-2.5 transition-colors hover:border-sky-300 hover:bg-sky-50/40"
                    role="button"
                    tabindex="0"
                    @click="peer.expanded = !peer.expanded"
                    @keydown.enter.prevent="peer.expanded = !peer.expanded"
                    @keydown.space.prevent="peer.expanded = !peer.expanded"
                >
                    <span class="min-w-0 text-sm font-semibold text-gray-600 transition-colors group-hover:text-gray-800">
                        {{ peer.name.trim() ? peer.name.trim() : `节点 #${index + 1}` }}
                    </span>
                    <button
                        class="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700"
                        type="button"
                        @click.stop="peer.expanded = !peer.expanded"
                        aria-label="切换节点展开状态"
                    >
                        <svg
                            v-if="peer.expanded"
                            viewBox="0 0 20 20"
                            class="h-4 w-4"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M5 12l5-5 5 5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg
                            v-else
                            viewBox="0 0 20 20"
                            class="h-4 w-4"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M5 8l5 5 5-5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                <div v-if="peer.expanded">
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                            >节点备注</label
                        >
                        <input
                            type="text"
                            v-model="peer.name"
                            placeholder="例如: 手机 / 笔记本"
                            class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                        />
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                            >PublicKey (节点公钥)</label
                        >
                        <input
                            type="text"
                            v-model="peer.publicKey"
                            placeholder="填入该节点的 PublicKey"
                            class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                        />
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-1.5 text-gray-600"
                            >主机号</label
                        >
                        <input
                            type="number"
                            min="1"
                            step="1"
                            v-model="peer.hostPart"
                            placeholder="例如: 101"
                            class="w-full p-2.5 border border-gray-300 rounded-md box-border text-sm font-mono transition-colors focus:outline-none focus:border-black"
                        />
                    </div>
                </div>

                <div v-if="peer.expanded" class="mt-4 flex justify-end">
                    <button
                        class="px-3 py-1.5 text-red-600 border border-red-200 bg-white rounded-md cursor-pointer text-xs font-semibold transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                        type="button"
                        @click="removePeer(index)"
                    >
                        删除此节点
                    </button>
                </div>
            </div>

            <button
                class="w-full p-3 bg-white border border-dashed border-gray-300 rounded-md cursor-pointer text-sm font-semibold transition-colors text-gray-600 mt-1 hover:border-black hover:text-black"
                @click="addPeer"
            >
                + 添加新节点
            </button>
            <div class="h-12"></div>
        </div>

        <div class="w-1/2 p-8 bg-gray-50 overflow-y-auto box-border flex flex-col min-h-0">
            <div class="mb-4 flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
                <h2 class="mt-0 text-xl font-semibold">wg.conf 预览</h2>
                <button
                    class="shrink-0 rounded-md border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-sky-700 hover:bg-sky-700"
                    @click="copyGeneratedConfig"
                >
                    复制
                </button>
            </div>
            <pre
                class="bg-white p-5 rounded-lg border border-gray-200 font-mono text-sm leading-relaxed overflow-x-auto grow whitespace-pre-wrap wrap-break-word shadow-inner"
                >{{ generatedConfig }}</pre
            >
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import nacl from "tweetnacl";

interface Peer {
    id: number;
    name: string;
    publicKey: string;
    hostPart: number | null;
    expanded: boolean;
}

interface WgConfig {
    host: string;
    port: number | null;
    mtu: number | null;
    privateKey: string;
    publicKey: string;
    postUp: string[];
    postDown: string[];
    peers: Peer[];
}

const STORAGE_KEY = "hm-tools.wireguard-config-generator";

const createDefaultConfig = (): WgConfig => ({
    host: "10.8.0.1",
    port: 51820,
    mtu: 1420,
    privateKey: "",
    publicKey: "",
    postUp: [
        "iptables -A FORWARD -i %i -j ACCEPT;",
        "iptables -A FORWARD -o %i -j ACCEPT;",
        "iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE",
    ],
    postDown: [
        "iptables -D FORWARD -i %i -j ACCEPT;",
        "iptables -D FORWARD -o %i -j ACCEPT;",
        "iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE",
    ],
    peers: [],
});

const encodeBase64 = (arr: Uint8Array): string => btoa(String.fromCharCode(...arr));
const decodeBase64 = (str: string): Uint8Array | null => {
    try {
        const bin = atob(str);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return arr;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const config = reactive<WgConfig>(createDefaultConfig());

let peerIdCounter = 0;

const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

const loadConfig = () => {
    const rawConfig = localStorage.getItem(STORAGE_KEY);
    if (!rawConfig) return;

    try {
        const savedConfig = JSON.parse(rawConfig) as Partial<WgConfig>;
        Object.assign(config, createDefaultConfig(), savedConfig);

        if (typeof config.host === "string" && config.host.endsWith("/24")) {
            config.host = config.host.slice(0, -3);
        }

        config.peers = config.peers.map((peer, index) => ({
            id: typeof peer.id === "number" ? peer.id : index,
            name: typeof peer.name === "string" ? peer.name : "",
            publicKey: typeof peer.publicKey === "string" ? peer.publicKey : "",
            hostPart: typeof peer.hostPart === "number" && Number.isFinite(peer.hostPart) ? peer.hostPart : null,
            expanded: typeof peer.expanded === "boolean" ? peer.expanded : true,
        }));

        peerIdCounter = config.peers.reduce((maxId, peer) => Math.max(maxId, peer.id + 1), 0);
    } catch (error) {
        console.error(error);
    }
};

const generateKeys = () => {
    const secretKey = nacl.randomBytes(32);
    secretKey[0]! &= 248;
    secretKey[31]! &= 127;
    secretKey[31]! |= 64;
    const publicKey = nacl.scalarMult.base(secretKey);
    config.privateKey = encodeBase64(secretKey);
    config.publicKey = encodeBase64(publicKey);
};

const derivePublicKey = () => {
    if (!config.privateKey) {
        config.publicKey = "";
        return;
    }
    const secretKey = decodeBase64(config.privateKey);
    if (secretKey && secretKey.length === 32) {
        try {
            const publicKey = nacl.scalarMult.base(secretKey);
            config.publicKey = encodeBase64(publicKey);
        } catch (e) {
            console.error(e);
            config.publicKey = "(无效的私钥格式)";
        }
    } else {
        config.publicKey = "(密钥长度或格式不正确)";
    }
};

const addPostUp = () => config.postUp.push("");
const removePostUp = (index: number) => config.postUp.splice(index, 1);
const addPostDown = () => config.postDown.push("");
const removePostDown = (index: number) => config.postDown.splice(index, 1);

const addPeer = () => {
    config.peers.push({ id: peerIdCounter++, name: "", publicKey: "", hostPart: null, expanded: true });
};
const removePeer = (index: number) => config.peers.splice(index, 1);

const resetConfig = () => {
    const defaultConfig = createDefaultConfig();
    Object.assign(config, defaultConfig);
    peerIdCounter = 0;
    generateKeys();
    saveConfig();
};

const copyGeneratedConfig = async () => {
    await navigator.clipboard.writeText(generatedConfig.value);
};

const copyPublicKey = async () => {
    if (!config.publicKey.trim()) return;
    await navigator.clipboard.writeText(config.publicKey);
};

const getHostBase = (host: string): string => host.trim().replace(/\/24$/, "");

const getPeerNetworkPrefix = (host: string): string => {
    const hostParts = getHostBase(host).split(".");
    if (hostParts.length !== 4) return "10.8.0";

    return hostParts.slice(0, 3).join(".");
};

const generatedConfig = computed(() => {
    let conf = `[Interface]\n`;
    const hostBase = getHostBase(config.host);
    const peerNetworkPrefix = getPeerNetworkPrefix(hostBase);

    if (hostBase) conf += `Address = ${hostBase}/24\n`;
    if (config.port) conf += `ListenPort = ${config.port}\n`;
    if (config.mtu) conf += `MTU = ${config.mtu}\n`;
    if (config.privateKey) conf += `PrivateKey = ${config.privateKey}\n`;

    config.postUp.forEach((rule) => {
        if (rule.trim()) conf += `PostUp = ${rule.trim()}\n`;
    });
    config.postDown.forEach((rule) => {
        if (rule.trim()) conf += `PostDown = ${rule.trim()}\n`;
    });

    config.peers.forEach((peer) => {
        const hostPart = typeof peer.hostPart === "number" ? peer.hostPart : null;
        if (!peer.publicKey.trim() && hostPart === null) return;
        conf += `\n[Peer]\n`;
        if (peer.name.trim()) conf += `# ${peer.name.trim()}\n`;
        if (peer.publicKey.trim()) conf += `PublicKey = ${peer.publicKey.trim()}\n`;
        if (hostPart !== null) conf += `AllowedIPs = ${peerNetworkPrefix}.${hostPart}/32\n`;
    });
    return conf;
});

onMounted(() => {
    loadConfig();

    if (!config.privateKey) {
        generateKeys();
    } else if (!config.publicKey) {
        derivePublicKey();
    }
});

watch(
    config,
    () => {
        saveConfig();
    },
    { deep: true },
);
</script>
