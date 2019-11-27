import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def get_example(request):
    # query = json.loads(request.body)

    data = {
        'title': 'Rolling in the Deep',
        'artist': 'Adele',
    }
    return JsonResponse(data)
