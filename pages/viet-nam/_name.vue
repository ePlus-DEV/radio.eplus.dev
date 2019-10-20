<template>
  <div>
    {{ $route.params.name }}

  </div>
</template>

<script>
    export default {
        head() {
            return {
                title: this.title,
                meta: [
                    // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                    {
                        hid: 'description',
                        name: 'description',
                        content: 'My custom description'
                    }
                ],
                /*script: [
                    {src: '/assets/custom/js/fix.js', body: true, ssr: true},
                ],*/
            }
        },
        data () {
            return {
                name: null,
                title: 'Radio tại Việt Nam'
            }
        },
        mounted () {
            this.name = this._name;
            var self = this;
            self.title = this.$route.params.name.toUpperCase()+' - '+this.title
            self.$emit('updateHead')
        },
    }
</script>
