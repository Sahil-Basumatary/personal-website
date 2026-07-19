// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  isProjectStoryPath,
  projectSlugFromStoryPath,
} from './project-story-path';

describe('project-story-path', () => {
  it('extracts the slug from a project story path', () => {
    expect(
      projectSlugFromStoryPath('/Desktop/Projects/pioni/About this project')
    ).toBe('pioni');
    expect(
      isProjectStoryPath('/Desktop/Projects/tennisly/About this project')
    ).toBe(true);
  });

  it('rejects other documents', () => {
    expect(projectSlugFromStoryPath('/Desktop/About Me')).toBeNull();
    expect(projectSlugFromStoryPath('/README.md')).toBeNull();
    expect(
      projectSlugFromStoryPath('/Desktop/Projects/pioni/tech-stack.json')
    ).toBeNull();
    expect(
      projectSlugFromStoryPath('/Desktop/Projects/About this project')
    ).toBeNull();
  });
});
