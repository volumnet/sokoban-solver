import {describe, expect, test} from '@jest/globals';
import { Point, BlockMovement } from 'app/model';

describe('Класс Point', () => {
  describe('Проверка свойств', () => {
    test('get x', () => {
      const point = new Point(3, 2);
      expect(point.x).toBe(3);
    });
    test('get y', () => {
      const point = new Point(3, 2);
      expect(point.y).toBe(2);
    });
    test('get [0]', () => {
      const point = new Point(3, 2);
      expect(point[0]).toBe(3);
    });
    test('get [1]', () => {
      const point = new Point(3, 2);
      expect(point[1]).toBe(2);
    });
  })

  describe('Проверка сдвигов', () => {
    describe('get left', () => {
      test('Нормальная реализация (в пределах поля)', () => {
        const point = new Point(3, 2);
        const nextPoint = point.left;
        
        expect(nextPoint).not.toBe(point);
        expect(nextPoint.x).toBe(2);
        expect(nextPoint.y).toBe(2);
      });
      test('null (за рамками поля)', () => {
        const point = new Point(0, 2);
        const nextPoint = point.left;
        
        expect(nextPoint).toBe(null);
      });
    })
    describe('get right', () => {
      test('Нормальная реализация (в пределах поля)', () => {
        const point = new Point(3, 2);
        const nextPoint = point.right;
        
        expect(nextPoint).not.toBe(point);
        expect(nextPoint.x).toBe(4);
        expect(nextPoint.y).toBe(2);
      });
      test('null (за рамками поля)', () => {
        const point = new Point(99, 2);
        const nextPoint = point.right;
        
        expect(nextPoint).toBe(null);
      });
    });
    describe('get up', () => {
      test('Нормальная реализация (в пределах поля)', () => {
        const point = new Point(3, 2);
        const nextPoint = point.up;
        
        expect(nextPoint).not.toBe(point);
        expect(nextPoint.x).toBe(3);
        expect(nextPoint.y).toBe(1);
      });
      test('null (за рамками поля)', () => {
        const point = new Point(3, 0);
        const nextPoint = point.up;
        
        expect(nextPoint).toBe(null);
      });
    });
    describe('get down', () => {
      test('Нормальная реализация (в пределах поля)', () => {
        const point = new Point(3, 2);
        const nextPoint = point.down;
        
        expect(nextPoint).not.toBe(point);
        expect(nextPoint.x).toBe(3);
        expect(nextPoint.y).toBe(3);
      });
      test('null (за рамками поля)', () => {
        const point = new Point(3, 99);
        const nextPoint = point.down;
        
        expect(nextPoint).toBe(null);
      });
    });
  });

  describe('Проверка защиты от изменений', () => {
    test('push', () => {
      const point = new Point(3, 2);
      expect(() => point.push(4)).toThrow();
    });
    test('unshift', () => {
      const point = new Point(3, 2);
      expect(() => point.unshift(4)).toThrow();
    });
  });

  describe('Проверка сериализации/десериализации', () => {
    test('str', () => {
      const point = new Point(3, 2);
      expect(point.str).toBe('32');
    });
    test('toString()', () => {
      const point = new Point(3, 2);
      expect(point.toString()).toBe('32');
    });
    test('fromString', () => {
      const point = Point.fromString('32');
      expect(point.x).toBe(3);
      expect(point.y).toBe(2);
    });
  });


  describe('Проверка stepTo()', () => {
    test('stepTo(BlockMovement.None)', () => {
      const point = new Point(3, 2);
      const nextPoint = point.stepTo(BlockMovement.None);
      
      expect(nextPoint).toBe(point);
    });
    test('stepTo(BlockMovement.Left)', () => {
      const point = new Point(3, 2);
      const nextPoint = point.stepTo(BlockMovement.Left);
      
      expect(nextPoint).not.toBe(point);
      expect(nextPoint.x).toBe(2);
      expect(nextPoint.y).toBe(2);
    });
    test('stepTo(BlockMovement.Right)', () => {
      const point = new Point(3, 2);
      const nextPoint = point.stepTo(BlockMovement.Right);
      
      expect(nextPoint).not.toBe(point);
      expect(nextPoint.x).toBe(4);
      expect(nextPoint.y).toBe(2);
    });
    test('stepTo(BlockMovement.Up)', () => {
      const point = new Point(3, 2);
      const nextPoint = point.stepTo(BlockMovement.Up);
      
      expect(nextPoint).not.toBe(point);
      expect(nextPoint.x).toBe(3);
      expect(nextPoint.y).toBe(1);
    });
    test('stepTo(BlockMovement.Down)', () => {
      const point = new Point(3, 2);
      const nextPoint = point.stepTo(BlockMovement.Down);
      
      expect(nextPoint).not.toBe(point);
      expect(nextPoint.x).toBe(3);
      expect(nextPoint.y).toBe(3);
    });
  })

  describe('isSame()', () => {
    test('одинаковые (по объекту)', () => {
      const point1 = new Point(3, 2);

      expect(point1.isSame(point1)).toBeTruthy();
    });

    test('одинаковые (по координатам)', () => {
      const point1 = new Point(3, 2);
      const point2 = new Point(3, 2);

      expect(point2).not.toBe(point1);
      expect(point1.isSame(point2)).toBeTruthy();
      expect(point2.isSame(point1)).toBeTruthy();
    });

    test('разные', () => {
      const point1 = new Point(3, 2);
      const point2 = new Point(2, 3);

      expect(point2).not.toBe(point1);
      expect(point1.isSame(point2)).toBeFalsy();
      expect(point2.isSame(point1)).toBeFalsy();
    });
  })
});