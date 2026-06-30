import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * tag 기능 E2E — docs/features/tag/prd.md 사용자 스토리 기반.
 *
 * 단위 테스트(src/lib/tags.test.ts, useTags.test.tsx, TagList/TagInput/NoteEditor.test.tsx)는
 * 파싱 규칙·렌더·훅 분기를 "mock된 context" 위에서 이미 덮는다. 그래서 E2E는 그 중복을 피하고
 * 단위가 원천적으로 못 하는 것 — 실제 json-server에 저장되고 새로고침 후에도 유지되는
 * 통합·영속성 — 에만 집중한다.
 *
 * 스킵(코드 미구현, PRD가 앞섬):
 *  - US-2(태그 삭제): TagList에 삭제 × 없음, useTags에 removeTag 없음.
 *  - US-4(생성 시 태그 부여): 생성 모드에 TagInput이 없고 createNote가 tags를 받지 않음.
 */

const API = 'http://localhost:3001';

test.describe('tag E2E', () => {
  const createdIds: string[] = [];

  async function seedNote(
    request: APIRequestContext,
    data: { title: string; content?: string; tags?: string[] },
  ) {
    const res = await request.post(`${API}/notes`, {
      data: { content: '', tags: [], ...data },
    });
    const note = (await res.json()) as { id: string };
    createdIds.push(note.id);
    return note;
  }

  test.afterEach(async ({ request }) => {
    await Promise.all(createdIds.map((id) => request.delete(`${API}/notes/${id}`)));
    createdIds.length = 0;
  });

  test('US-3: 태그가 있는 노트를 선택하면 편집 화면에 태그 칩이 표시된다', async ({
    page,
    request,
  }) => {
    const title = `[e2e] 태그확인 ${Date.now()}`;
    const tag = `확인태그-${Date.now()}`;
    // 실제 서버에 태그가 달린 노트를 심는다(읽기 경로를 검증하므로 UI로 만들지 않는다).
    await seedNote(request, { title, tags: [tag] });

    await page.goto('/');
    await page.getByText(title).click(); // 사이드바에서 선택 → 편집 모드

    // 단위(TagList.test)는 props→DOM을 보지만, 여기선 fetch→Context→편집화면까지의
    // 통합 경로로 서버의 태그가 칩으로 떠야 한다.
    await expect(page.getByTestId('tag-area').getByText(tag)).toBeVisible();
  });

  test('US-1/US-5: 편집 중 태그를 추가하면 저장 버튼 없이 즉시 저장되어 새로고침 후에도 유지된다', async ({
    page,
    request,
  }) => {
    const title = `[e2e] 태그추가 ${Date.now()}`;
    const tag = `추가태그-${Date.now()}`;
    await seedNote(request, { title, tags: [] });

    await page.goto('/');
    await page.getByRole('heading', { name: title }).click();

    // 입력→Enter로 확정하면 칩이 뜬다(통합 결과만 본다 — 파싱 규칙은 단위가 덮음).
    const tagInput = page.getByPlaceholder('태그 입력 후 Enter');
    await tagInput.fill(tag);
    await tagInput.press('Enter');
    await expect(page.getByTestId('tag-area').getByText(tag)).toBeVisible();

    // E2E만 할 수 있는 검증: '저장' 버튼을 누르지 않았는데도 즉시 서버에 반영되어
    // 새로고침 후에도 남아 있다(US-5 즉시 저장).
    await page.reload();
    await page.getByRole('heading', { name: title }).click();
    // 재선택으로 편집 모드에 진입했는지 먼저 확인(목록 로딩/리렌더 레이스 방지).
    await expect(page.getByPlaceholder('태그 입력 후 Enter')).toBeVisible();
    await expect(page.getByTestId('tag-area').getByText(tag)).toBeVisible();
  });
});
