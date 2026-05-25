import { GetUserGroupOptionsQuery } from './get-user-group-options.query';

describe('GetUserGroupOptionsQuery', () => {
  let query: GetUserGroupOptionsQuery;

  beforeEach(() => {
    query = new GetUserGroupOptionsQuery();
  });

  it('유저 그룹 enum을 옵션 형태로 조회한다', async () => {
    const result = await query.execute();

    expect(result).toEqual([
      { value: '권수영&임강미M', label: '권수영&임강미M' },
      { value: '노시은&윤승오M', label: '노시은&윤승오M' },
      { value: '배윤희&김준영M', label: '배윤희&김준영M' },
      { value: '브릿지', label: '브릿지' },
      { value: '기타', label: '기타' },
    ]);
  });
});
