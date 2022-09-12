export default async (context, locale) => {
  return await Promise.resolve({
    navmenu: {
      homepage: "ホームページ",
      about: "約",
      blog: "ブログ",
      group: "グループ",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      contact: "コンタクト",
      language: "言語：",
      old_version: "#oldversion",
      statistics: "統計学",
      changelog: "変更ログ",
    },
    terms: {
      content:
        "Radio channels are sourced from stations around the world, we are not responsible for the content of Radio channels. Please think before you plan to follow something. The website is completely free, does not charge or make money in any way on the website.",
    },
    contact: {
      content:
        "We always appreciate any comments or contributions to stream links to diversify Radio channels on the website. For any contributions, please contact the contact below. Thank you.",
    },
    world: {
      africa: {
        name: "アフリカ",
        nigeria: "ナイジェリア",
      },
      asia: {
        name: "アジア",
        vietnam: "ベトナム",
        singapore: "シンガポール",
        korea: "韓国",
        china: "中国",
        hong_kong: "香港",
        japan: "日本",
        malaysia: "マレーシア",
        philippines: "フィリピン",
        indonesia: "インドネシア",
        thailand: "タイ",
      },
      central_america: {
        name: "中米",
        costa_rica: "コスタリカ",
        el_salvador: "エルサルバドル",
        guatemala: "グアテマラ",
        honduras: "ホンジュラス",
      },
      europe: {
        name: "ヨーロッパ",
        united_kingdom: "イギリス",
        ukraine: "ウクライナ",
        russia: "ロシア",
      },
      north_america: {
        name: "北米",
        cuba: "キューバ",
        haiti: "ハイチ",
        jamaica: "ジャマイカ",
        mexico: "メキシコ",
        puerto_rico: "プエルトリコ",
        dominican_republic: "ドミニカ共和国",
        trinidad_and_tobago: "トリニダード・トバゴ",
      },
      oceania: {
        name: "オセアニア",
        australia: "オーストラリア",
        new_zealand: "ニュージーランド",
      },
      south_america: {},
    },
    panel: {
      most_popular: "{name} で最も人気のある",
      frequency: "周波数",
      play_from_radio: "ラジオから再生",
      country: "国",
      radio_in: "{name}のラジオ",
      description: "説明",
      category: "カテゴリー",
      schedule: "スケジュール",
      playlist: "プレイリスト",
      next: "次",
      lyric: "歌詞",
      no_lyric: "歌詞なし",
      updating: "更新中...",
    },
    button: {
      back: "戻る",
      close: "近い",
    },
    popup: {
      search: {
        text: "探す...",
        stats:
          "{nbPages} のページ {page} - {processingTimeMS} ミリ秒で取得された {nbHits} ヒット",
      },
    },
    notify: {
      success: "成功",
      success_content: "ラジオを再生できます: {radio}",
      error: "エラー",
      error_content: "ラジオを再生できません: {radio}",
    },
    statistics_tooltip: {
      text: "インシデント: {num} | ダウンタイム: {time} 分",
    },
    404: {
      content:
        "We would like to inform you that the page you are looking for, does not exist!",
    },
    table: {
      status: "状態",
      commit: "専念",
      created: "作成した",
      updated: "更新しました",
      published: "公開済み",
      view: "意見",
    },
    alert: {
      play_button:
        "ブラウザのデフォルトでは、ラジオを聞くには ▶ ボタンを押す必要があります。",
    },
    text: {
      guide: "ガイド",
    },
  });
};
