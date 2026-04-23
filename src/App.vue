<script setup lang="ts">
import { computed } from "vue";
import WireGuardRelayConfigGenerator from "./WireGuardRelayConfigGenerator.vue";

interface ToolItem {
    name: string;
    path: string;
    description: string;
    component: typeof WireGuardRelayConfigGenerator;
}

const tools: ToolItem[] = [
    {
        name: "WireGuard 中继配置生成器",
        path: "/wireguard-relay-config-generator",
        description: "生成 WireGuard 中继节点配置",
        component: WireGuardRelayConfigGenerator,
    },
];

const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
const defaultTool = tools[0] as ToolItem;

const activeTool = computed<ToolItem>(
    () => tools.find((tool) => tool.path === currentPath) ?? defaultTool,
);
</script>

<template>
    <div class="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
        <aside
            class="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100"
        >
            <div class="border-b border-slate-800 px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    HM Tools
                </p>
                <h1 class="mt-2 text-base font-semibold text-white">工具导航</h1>
            </div>

            <nav class="flex-1 overflow-y-auto p-2">
                <a
                    v-for="tool in tools"
                    :key="tool.path"
                    :href="tool.path"
                    :title="tool.description"
                    class="block rounded-lg border px-3 py-2.5 transition-colors"
                    :class="
                        activeTool.path === tool.path
                            ? 'border-slate-700 bg-slate-800 text-white'
                            : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                    "
                >
                    <div class="text-sm font-semibold leading-5">{{ tool.name }}</div>
                </a>
            </nav>
        </aside>

        <main class="min-w-0 flex-1 overflow-hidden bg-white">
            <component :is="activeTool.component" class="h-full w-full" />
        </main>
    </div>
</template>

<style scoped></style>
