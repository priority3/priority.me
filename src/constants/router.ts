export enum RouterListType {
  normalPage = 'blogs',
  LeetcodePage = 'leetcode',
}

export const ShouldShowTag = {
  [RouterListType.normalPage]: false,
  [RouterListType.LeetcodePage]: true,
}
