const katakanaCharacters = [
    "ア", "イ", "ウ", "エ", "オ",
    "カ", "キ", "ク", "ケ", "コ",
    "サ", "シ", "ス", "セ", "ソ",
    "タ", "チ", "ツ", "テ", "ト",
    "ナ", "ニ", "ヌ", "ネ", "ノ",
    "ハ", "ヒ", "フ", "ヘ", "ホ",
    "マ", "ミ", "ム", "メ", "モ",
    "ヤ", "", "ユ", "", "ヨ",
    "ラ", "リ", "ル", "レ", "ロ",
    "ワ", "", "", "", "ヲ", "ン"
];

function startKatakanaGameLogic() {
    startKanaGame(katakanaCharacters, "Katakana Table Fill");
}
