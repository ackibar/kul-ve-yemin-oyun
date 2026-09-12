"""Mevcut karakterden silahli bir 'state' uretir ve isi bekler."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import pxl


def wait(jobs, label=''):
    jobs = [jobs] if isinstance(jobs, str) else jobs
    for i in range(120):
        sts = [pxl.call(f'/background-jobs/{j}').get('status') for j in jobs]
        if i % 5 == 0:
            print(f'  {i*5:3d}sn {label} {sts}', flush=True)
        if all(s in ('completed', 'succeeded', 'done', 'failed', 'error') for s in sts):
            return sts
        time.sleep(5)
    return sts


if __name__ == '__main__':
    src = open('_arsiv/uretim/pixellab/gezgin/id.txt').read().strip()
    name, desc = sys.argv[1], sys.argv[2]
    before = pxl.balance()[0]
    r = pxl.call('/create-character-state', {
        'character_id': src, 'edit_description': desc, 'state_name': name,
        'use_color_palette_from_reference': True, 'no_background': True, 'seed': 21})
    print(json.dumps(r)[:260])
    cid = r.get('character_id')
    jobs = r.get('background_job_ids') or [r.get('background_job_id')]
    wait([j for j in jobs if j], name)
    after = pxl.balance()[0]
    print(f'{name}: id={cid}  maliyet={before-after:.0f} uretim  bakiye={after:.0f}')
    open(f'_arsiv/uretim/pixellab/gezgin/id_{name}.txt', 'w').write(cid or '')
