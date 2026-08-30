import {ImageLoadSchedulerService} from './image-load-scheduler.service';

describe('ImageLoadSchedulerService', () => {
  it('limits parallel loads and removes a cancelled task from the queue', () => {
    const service = new ImageLoadSchedulerService();
    const startedTasks: number[] = [];
    const handles = Array.from({length: 8}, (_, index) =>
      service.schedule(() => startedTasks.push(index))
    );

    expect(startedTasks).toEqual([0, 1, 2, 3, 4, 5]);

    handles[6].cancel();
    handles[0].complete();

    expect(startedTasks).toEqual([0, 1, 2, 3, 4, 5, 7]);

    handles.forEach(handle => handle.cancel());
  });
});
