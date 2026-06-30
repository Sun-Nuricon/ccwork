export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // 본문(비어있지 않은 줄)이 최소 N줄 이상인지 검사
        'body-min-lines': (parsed, _when, value) => {
          const lines = (parsed.body ?? '')
            .split('\n')
            .filter((line) => line.trim() !== '');
          return [
            lines.length >= value,
            `본문은 최소 ${value}줄 이상 작성해야 합니다 (현재 ${lines.length}줄)`,
          ];
        },
      },
    },
  ],
  rules: {
    'subject-empty': [2, 'never'], // 제목 필수
    'body-empty': [2, 'never'], // 본문 필수
    'body-leading-blank': [2, 'always'], // 제목과 본문 사이 빈 줄 강제
    'body-min-lines': [2, 'always', 2], // 본문 최소 2줄
  },
};
