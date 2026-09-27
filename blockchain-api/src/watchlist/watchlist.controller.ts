import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { AddWatchlistDto } from './dto/add-watchlist.dto';
import { CurrentUser, type CurrentUserPayload } from '../auth/current-user.decorator';

@ApiTags('Watchlist')
@ApiBearerAuth()
@Controller('watchlist')
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) {}

    @ApiOperation({ summary: 'Watch an address (follow analog)' })
    @Post()
    add(@Body() dto: AddWatchlistDto, @CurrentUser() user: CurrentUserPayload) {
        return this.watchlistService.add(user.userId, dto.address);
    }

    @ApiOperation({ summary: 'Stop watching an address' })
    @Delete(':address')
    remove(
        @Param('address') address: string,
        @CurrentUser() user: CurrentUserPayload,
    ) {
        return this.watchlistService.remove(user.userId, address);
    }

    @ApiOkResponse({ description: 'Returns the current user\'s watched addresses' })
    @ApiOperation({ summary: 'List my watchlist' })
    @Get()
    list(@CurrentUser() user: CurrentUserPayload) {
        return this.watchlistService.list(user.userId);
    }
}
