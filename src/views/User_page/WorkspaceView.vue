<template>
    <base-workspace :workspaceId="workspaceId"></base-workspace>
</template>

<script>
import BaseWorkSpace from '@/components/Workspace/BaseWorkspace.vue'

export default {
    components: {
        'base-workspace': BaseWorkSpace
    },
    props: ['workspaceId'],
    mounted() {
        console.log('Received workspaceId:', this.workspaceId);
        // Log for debugging
    }
}
</script>