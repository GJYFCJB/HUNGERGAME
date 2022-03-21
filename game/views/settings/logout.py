from django.http import JsonResponse
from django.contrib.auth import logout


def signout(request):
    user = request.user;
    #if has loged out
    if not user.is_authenticated:
        return JsonResponse({
            'result' : "success",
        })
    #or logout directly
    logout(request)
    return JsonResponse({
       'result' : "success",
    })
