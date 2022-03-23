
from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player


def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()

    if not username or not password:
        return JsonResponse({
            'result' : "Username and password should not be empty",
        })

    if password != password_confirm:
        return JsonResponse({
            'result' : "Password should be same",
        })

        #search the database
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result' : "Username exists",
        })

    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://cdn.acwing.com/media/user/profile/photo/119289_lg_f585d6bea8.jpeg")
    login(request,user)
    return JsonResponse({
        'result' : "success",
    })
