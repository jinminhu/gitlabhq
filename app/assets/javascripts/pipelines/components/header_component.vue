<script>
import ciHeader from '../../vue_shared/components/header_ci_component.vue';
import eventHub from '../event_hub';
import loadingIcon from '../../vue_shared/components/loading_icon.vue';

export default {
  name: 'PipelineHeaderSection',
  props: {
    pipeline: {
      type: Object,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    ciHeader,
    loadingIcon,
  },

  data() {
    return {
      actions: this.getActions(),
    };
  },

  computed: {
    status() {
      return this.pipeline.details && this.pipeline.details.status;
    },
    shouldRenderContent() {
      return !this.isLoading && Object.keys(this.pipeline).length;
    },
  },

  methods: {
    postAction(action) {
      const index = this.actions.indexOf(action);

      this.$set(this.actions[index], 'isLoading', true);

      eventHub.$emit('headerPostAction', action);
    },

    getActions() {
      const actions = [];

      if (this.pipeline.retry_path) {
        actions.push({
          label: 'Retry',
          path: this.pipeline.retry_path,
          cssClass: 'js-retry-button btn btn-inverted-secondary',
          type: 'button',
          isLoading: false,
        });
      }

      if (this.pipeline.cancel_path) {
        actions.push({
          label: 'Cancel running',
          path: this.pipeline.cancel_path,
          cssClass: 'js-btn-cancel-pipeline btn btn-danger',
          type: 'button',
          isLoading: false,
        });
      }

      return actions;
    },
  },

  watch: {
    pipeline() {
      this.actions = this.getActions();
    },
  },
};
</script>
<template>
  <div class="pipeline-header-container">
    <ci-header
      v-if="shouldRenderContent"
      :status="status"
      item-name="Pipeline"
      :item-id="pipeline.id"
      :time="pipeline.created_at"
      :user="pipeline.user"
      :actions="actions"
      @actionClicked="postAction"
      />
    <loading-icon
      v-else
      size="2"/>
  </div>
</template>
