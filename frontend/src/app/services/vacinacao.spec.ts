import { TestBed } from '@angular/core/testing';

import { Vacinacao } from './vacinacao';

describe('Vacinacao', () => {
  let service: Vacinacao;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vacinacao);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
