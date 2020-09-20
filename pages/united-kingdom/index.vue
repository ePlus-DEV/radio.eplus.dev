<template>
<div>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">Trang Chủ</el-breadcrumb-item>
        <el-breadcrumb-item>{{ title_slug }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin: 15px 0 15px 0">
        <div slot="header" class="clearfix">
            <el-badge value="Live" class="item">
                <el-button size="small">Thịnh Hành tại {{ title_slug }}</el-button>
            </el-badge>
            <el-badge class="item">
                <div class="ticker"></div>
            </el-badge>
        </div>

        <audio id="player" preload="auto" autoplay width="100%"></audio>
    </el-card>

    <PanelUnitedKingdom></PanelUnitedKingdom>
</div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelUnitedKingdom from "~/components/PanelUnitedKingdom.vue";

export default {
    head() {
        return {
            title: "Trang Chủ Radio " + this.title_slug + " - ",
            meta: [
                // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                {
                    hid: "description",
                    name: "description",
                    content: "Radio Online được phát từ " +
                        this.title_slug +
                        " - Heart UK, Heart London"
                }
            ]
        };
    },
    data() {
        return {
            name: null,
            title: "Radio tại " + this.title_slug,
            title_slug: "United Kingdom",
            slug: "united-kingdom"
        };
    },
    components: {
        PanelUnitedKingdom
    },
    methods: {
        async fetchData() {
            this.$axios
                .get("/assets/radio/favorite/" + this.slug + ".json")
                .then(res => {
                    const data = res.data;
                    var notify = this.$notify;

                    var player = new MediaElementPlayer("player", {
                        features: ["playpause", "progress", "tracks", "volume"],
                        enableKeyboard: true,
                        success: function (mediaElement) {
                            mediaElement.addEventListener(
                                "canplay",
                                function () {
                                    notify.success({
                                        title: "Thành công",
                                        message: "Phát từ radio " + data["title"]
                                    });

                                    $(".mejs__time-rail").html(
                                        '<div class="ticker radio-name-player"><ul><li>Phát từ Radio <strong>' +
                                        data["title"] +
                                        "</strong></li><li>Tần số: <strong>" +
                                        data["frequency"] +
                                        "</strong></li><li>Quốc gia: <strong>" +
                                        data["countries"] +
                                        "</strong></li></ul></div>"
                                    );
                                    $(".ticker").ticker();
                                },
                                false
                            );

                            mediaElement.addEventListener(
                                "error",
                                function () {
                                    notify.error({
                                        title: "Thất bại",
                                        message: "Tải không thành công radio " + data["title"]
                                    });
                                },
                                false
                            );

                            console.log("Player initialised");
                        }
                    });
                    player.setSrc(data["stream"]);
                });
        }
    },
    created() {
        this.loading = true;
        Promise.all([this.fetchData()]).then(() => {
            const loading = this.$loading({
                lock: true,
                text: "Loading",
                spinner: "el-icon-loading",
                background: "rgba(0, 0, 0, 0.7)"
            });
            loading.close();
        });
    }
};
</script>

<style>
.container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
}

.subtitle {
    font-weight: 300;
    font-size: 42px;
    color: #526488;
    word-spacing: 5px;
    padding-bottom: 15px;
}

.links {
    padding-top: 15px;
}

.ticker {
    width: 500px;
    margin: 10px auto;
}

/* The HTML list gets replaced with a single div,
     which contains the active ticker item, so you
     can easily style that as well */
.ticker div {
    display: inline-block;
    word-wrap: break-word;
}
</style>
