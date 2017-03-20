import { VGeniusPage } from './app.po';

describe('v-genius App', () => {
  let page: VGeniusPage;

  beforeEach(() => {
    page = new VGeniusPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
